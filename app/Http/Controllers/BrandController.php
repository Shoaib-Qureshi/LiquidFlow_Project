<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Brand::class, 'brand');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        
        if ($user->hasRole('Admin')) {
            // Admin can see all brands
            $brands = Brand::withCount(['tasks as task_total', 'tasks as task_active' => function($q) { $q->where('status', '<>', 'completed'); }, 'tasks as task_completed' => function($q) { $q->where('status', 'completed'); }])->orderBy('name')->get();
        } elseif ($user->hasRole('Manager')) {
            // Manager can see only their assigned brands
            $brands = $user->managedBrands()->withCount(['tasks as task_total', 'tasks as task_active' => function($q) { $q->where('status', '<>', 'completed'); }, 'tasks as task_completed' => function($q) { $q->where('status', 'completed'); }])->orderBy('name')->get();
            
            // If no brands assigned, show empty collection
            if ($brands->isEmpty()) {
                $brands = collect();
            }
        } else {
            // TeamUser can only see brands they are assigned to
            $brands = $user->assignedBrands()->withCount(['tasks as task_total', 'tasks as task_active' => function($q) { $q->where('status', '<>', 'completed'); }, 'tasks as task_completed' => function($q) { $q->where('status', 'completed'); }])->orderBy('name')->get();
        }

        // Map to shape expected by the frontend (taskStats nested object)
        $brandsPayload = $brands->map(function($b) {
            return [
                'id' => $b->id,
                'name' => $b->name,
                'description' => $b->description,
                'status' => $b->status,
                'created_at' => $b->created_at,
                'taskStats' => [
                    'total' => $b->task_total ?? 0,
                    'active' => $b->task_active ?? 0,
                    'completed' => $b->task_completed ?? 0,
                ]
            ];
        });

        return Inertia::render('Brands/Index', [
            'brands' => $brandsPayload
        ]);
    }

    /**
     * Show the form for creating a new brand.
     */
    public function create()
    {
        $user = Auth::user();
        // Admin can optionally assign a manager during creation
        $managers = [];
        if ($user->hasRole('Admin')) {
            $managers = User::role(['Manager'])->orderBy('name', 'asc')->get(['id', 'name', 'email']);
        }

        return Inertia::render('Brands/Create', [
            'managers' => $managers,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand)
    {
        $user = Auth::user();

        // Check if user can view this brand
        if ($user->hasRole('Admin')) {
            // Admin can view all brands
        } elseif ($user->hasRole('Manager')) {
            // Manager can only view brands they manage
            if (!$brand->managers()->where('user_id', $user->id)->exists()) {
                abort(403, 'You can only view your assigned brands.');
            }
        } else {
            // TeamUser can only view brands they are assigned to
            if (!$brand->teamUsers()->where('user_id', $user->id)->exists()) {
                abort(403, 'You can only view brands you are assigned to.');
            }
        }

        $brand->load(['managers', 'teamUsers', 'tasks.assignedUser', 'tasks.createdBy', 'createdBy']);

        return Inertia::render('Brands/Show', [
            'brand' => $brand
        ]);
    }

    /**
     * Show the form for editing the specified brand.
     */
    public function edit(Brand $brand)
    {
        $user = Auth::user();
        $managers = [];
        if ($user->hasRole('Admin')) {
            $managers = User::role(['Manager'])->orderBy('name', 'asc')->get(['id', 'name', 'email']);
        }

        return Inertia::render('Brands/Edit', [
            'brand' => $brand,
            'managers' => $managers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Check if manager already has a brand
        if ($user->hasRole('Manager')) {
            $existingBrand = Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->first();

            if ($existingBrand) {
                return redirect()->route('brands.index')
                    ->with('error', 'You can only create one brand for your company.');
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            'manager_id' => 'nullable|exists:users,id',
            // New fields
            'audience' => 'nullable|string',
            'other_details' => 'nullable|string',
            'started_on' => 'nullable|date',
            'in_progress' => 'nullable|boolean',
            'logo' => 'nullable|image|max:5120',
            'guideline' => 'nullable|file|max:10240',
        ]);

        $data = [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'audience' => $validated['audience'] ?? null,
            'other_details' => $validated['other_details'] ?? null,
            'started_on' => $validated['started_on'] ?? null,
            'in_progress' => isset($validated['in_progress']) ? (bool)$validated['in_progress'] : false,
            'created_by' => $user->id,
        ];

        // Handle uploads
        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('brands/'.uniqid().'/logo', 'public');
        }
        if ($request->hasFile('guideline')) {
            $data['file_path'] = $request->file('guideline')->store('brands/'.uniqid().'/guideline', 'public');
        }

        $brand = Brand::create($data);

        // If manager created the brand, assign themselves as manager
        if ($user->hasRole('Manager')) {
            $brand->managers()->attach($user->id);
        }

        // If Admin provided a manager_id when creating, assign the manager to this brand
        if ($user->hasRole('Admin') && !empty($validated['manager_id'])) {
            $manager = User::find($validated['manager_id']);
            // Verify manager has role Manager and isn't already assigned to another brand
            if (!$manager->hasRole('Manager')) {
                return redirect()->route('brands.index')
                    ->with('error', 'Selected user is not a manager.');
            }

            $existing = Brand::whereHas('managers', function ($q) use ($manager) {
                $q->where('user_id', $manager->id);
            })->first();

            if ($existing) {
                return redirect()->route('brands.index')
                    ->with('error', 'Selected manager already has a brand assigned.');
            }

            $brand->managers()->attach($manager->id);
        }

        return redirect()->route('brands.index')
            ->with('success', 'Brand created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            // New fields (optional on update)
            'audience' => 'nullable|string',
            'other_details' => 'nullable|string',
            'started_on' => 'nullable|date',
            'in_progress' => 'nullable|boolean',
            'logo' => 'nullable|image|max:5120',
            'guideline' => 'nullable|file|max:10240',
        ]);

        $data = [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? $brand->status ?? 'active',
            'audience' => $validated['audience'] ?? $brand->audience,
            'other_details' => $validated['other_details'] ?? $brand->other_details,
            'started_on' => $validated['started_on'] ?? $brand->started_on,
            'in_progress' => isset($validated['in_progress']) ? (bool)$validated['in_progress'] : (bool)$brand->in_progress,
        ];

        // Handle uploads (delete previous directory when replacing)
        if ($request->hasFile('logo')) {
            if (!empty($brand->logo_path)) {
                \Storage::disk('public')->deleteDirectory(dirname($brand->logo_path));
            }
            $data['logo_path'] = $request->file('logo')->store('brands/'.uniqid().'/logo', 'public');
        }
        if ($request->hasFile('guideline')) {
            if (!empty($brand->file_path)) {
                \Storage::disk('public')->deleteDirectory(dirname($brand->file_path));
            }
            $data['file_path'] = $request->file('guideline')->store('brands/'.uniqid().'/guideline', 'public');
        }

        $brand->update($data);

        return redirect()->route('brands.index')
            ->with('success', 'Brand updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand)
    {
        $brand->delete();

        return redirect()->route('brands.index')
            ->with('success', 'Brand deleted successfully.');
    }

    /**
     * Assign managers to the brand.
     */
    public function assignManagers(Request $request, Brand $brand)
    {
        $this->authorize('assignManager', $brand);

        $validated = $request->validate([
            'manager_ids' => 'required|array',
            'manager_ids.*' => 'exists:users,id'
        ]);

        // Verify all users are managers
        $managers = User::whereIn('id', $validated['manager_ids'])
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Manager');
            })
            ->get();

        // Check if any of the managers are already assigned to other brands
        foreach ($managers as $manager) {
            $existingBrand = Brand::whereHas('managers', function ($q) use ($manager) {
                $q->where('user_id', $manager->id);
            })->where('id', '!=', $brand->id)->first();

            if ($existingBrand) {
                return redirect()->route('brands.index')
                    ->with('error', "Manager {$manager->name} is already assigned to brand '{$existingBrand->name}'. Each manager can only be assigned to one brand.");
            }
        }

        // Sync the managers (this will replace existing assignments for this brand)
        $brand->managers()->sync($managers->pluck('id'));

        return redirect()->route('brands.index')
            ->with('success', 'Managers assigned successfully.');
    }

    /**
     * Serve the brand logo securely from public storage.
     */
    public function logo(Brand $brand)
    {
        $this->authorize('view', $brand);
        if (!$brand->logo_path || !\Storage::disk('public')->exists($brand->logo_path)) {
            abort(404);
        }
        $fullPath = storage_path('app/public/' . $brand->logo_path);
        return response()->file($fullPath);
    }

    /**
     * Serve the brand guideline file securely from public storage (as download).
     */
    public function guideline(Brand $brand)
    {
        $this->authorize('view', $brand);
        if (!$brand->file_path || !\Storage::disk('public')->exists($brand->file_path)) {
            abort(404);
        }
        $filename = basename($brand->file_path);
        return \Storage::disk('public')->download($brand->file_path, $filename);
    }

}
