<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        // Use explicit roles collection to avoid relying on trait helper methods in static analysis
        $roleNames = ($user->roles ?? collect())->pluck('name')->map(fn($role) => strtolower($role));
        $isAdmin = $roleNames->contains('admin');
        $isManager = $roleNames->contains('manager');

        if ($isAdmin) {
            // Admin can see all brands
            $brands = Brand::with(['client'])
                ->withCount(['tasks as task_total', 'tasks as task_active' => function ($q) {
                    $q->where('status', '<>', 'completed');
                }, 'tasks as task_completed' => function ($q) {
                    $q->where('status', 'completed');
                }])
                ->orderBy('name')->get();
        } elseif ($isManager) {
            // Manager can see only their assigned brands (found via brand_managers pivot)
            $brands = Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with(['client'])
                ->withCount(['tasks as task_total', 'tasks as task_active' => function ($q) {
                    $q->where('status', '<>', 'completed');
                }, 'tasks as task_completed' => function ($q) {
                    $q->where('status', 'completed');
                }])
                ->orderBy('name')->get();

            if ($brands->isEmpty()) {
                $brands = collect();
            }
        } else {
            // TeamUser can only see brands they are assigned to
            $brands = Brand::whereHas('teamUsers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with(['client'])
                ->withCount(['tasks as task_total', 'tasks as task_active' => function ($q) {
                    $q->where('status', '<>', 'completed');
                }, 'tasks as task_completed' => function ($q) {
                    $q->where('status', 'completed');
                }])
                ->orderBy('name')->get();
        }

        // Map to shape expected by the frontend (taskStats nested object)
        $brandsPayload = $brands->map(function ($b) {
            return [
                'id' => $b->id,
                'name' => $b->name,
                'description' => $b->description,
                'status' => $b->status,
                'created_at' => $b->created_at,
                'client' => $b->client ? [
                    'id' => $b->client->id,
                    'name' => $b->client->name,
                    'status' => $b->client->status,
                ] : null,
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $roleNames = ($user->roles ?? collect())->pluck('name')->map(fn ($role) => strtolower($role));
        $isManager = $roleNames->contains('manager');

        $managers = User::role('Manager')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $clientSelectionLocked = false;
        $clientsQuery = Client::orderBy('name');

        if ($isManager) {
            $clientSelectionLocked = true;
            $managerClientIds = $this->resolveManagerClientIds($user);

            if (!empty($managerClientIds)) {
                $clientsQuery->whereIn('id', $managerClientIds);
            } else {
                // Nothing to lock to if the manager has no associated clients
                $clientSelectionLocked = false;
            }
        }

        $clients = $clientsQuery->get(['id', 'name', 'status']);
        $clientIds = $clients->pluck('id');

        $preselectedClientId = request()->integer('client_id') ?: null;
        if ($clientSelectionLocked) {
            $preselectedClientId = $clientIds->first() ?: null;
        } elseif ($preselectedClientId && !$clientIds->contains($preselectedClientId)) {
            $preselectedClientId = null;
        }

        // Reuse the existing Inertia view that powers the "Add Brand" UI
        return Inertia::render('Project/Create', [
            'managers' => $managers,
            'clients' => $clients,
            'preselectedClientId' => $preselectedClientId,
            'clientSelectionLocked' => $clientSelectionLocked,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $roleNames = $user->getRoleNames()->map(fn($role) => strtolower($role));
        $isAdmin = $roleNames->contains('admin');
        $isManager = $roleNames->contains('manager');

        // Check if user can view this brand
        if ($isAdmin) {
            // Admin can view all brands
        } elseif ($isManager) {
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

        $brand->load([
            'managers',
            'teamUsers',
            'tasks.assignedUser',
            'tasks.createdBy',
            'createdBy',
            'client'
        ]);

        return Inertia::render('Brands/Show', [
            'brand' => $brand
        ]);
    }

    /**
     * Show the form for editing the specified brand.
     */
    public function edit(Brand $brand)
    {
        $brand->load(['managers', 'teamUsers', 'client']);

        $managers = User::role('Manager')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $clients = Client::orderBy('name')->get(['id', 'name', 'status']);

        return Inertia::render('Brands/Edit', [
            'brand' => $brand,
            'managers' => $managers,
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $roleNames = $user->getRoleNames()->map(fn($role) => strtolower($role));
        $isAdmin = $roleNames->contains('admin');
        $isManager = $roleNames->contains('manager');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'manager_id' => 'nullable|exists:users,id',
            'client_id' => 'required|exists:clients,id',
            'audience' => 'nullable|string',
            'other_details' => 'nullable|string',
            'started_on' => 'nullable|date',
            'in_progress' => 'nullable|boolean',
            'logo_path' => 'nullable|string',
            'file_path' => 'nullable|string',
        ]);

        if ($isManager) {
            $managerClientIds = $this->resolveManagerClientIds($user);

            if (empty($managerClientIds)) {
                throw ValidationException::withMessages([
                    'client_id' => 'No client is associated with your account. Please contact an administrator.',
                ]);
            }

            $selectedClientId = (int) $validated['client_id'];
            if (!in_array($selectedClientId, $managerClientIds, true)) {
                $selectedClientId = (int) $managerClientIds[0];
            }

            $validated['client_id'] = $selectedClientId;
        }

        $brand = Brand::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'created_by' => $user->id,
            'client_id' => $validated['client_id'],
            'audience' => $validated['audience'] ?? null,
            'other_details' => $validated['other_details'] ?? null,
            'started_on' => $validated['started_on'] ?? null,
            'in_progress' => $validated['in_progress'] ?? false,
            'logo_path' => $validated['logo_path'] ?? null,
            'file_path' => $validated['file_path'] ?? null,
        ]);

        // If manager created the brand, assign themselves as manager
        if ($isManager) {
            // use syncWithoutDetaching to avoid duplicate key errors if user already assigned
            $brand->managers()->syncWithoutDetaching([$user->id]);
        }

        // If Admin provided a manager_id when creating, assign the manager to this brand
        if ($isAdmin && !empty($validated['manager_id'])) {
            $manager = User::find($validated['manager_id']);
            // Verify selected user truly is a manager by checking roles collection
            $managerRoles = ($manager->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
            if (!$managerRoles->contains('manager')) {
                return redirect()->route('brands.index')
                    ->with('error', 'Selected user is not a manager.');
            }

            // Use syncWithoutDetaching so attaching the same manager twice won't error
            $brand->managers()->syncWithoutDetaching([$manager->id]);
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
            'status' => 'required|in:active,inactive',
            'client_id' => 'required|exists:clients,id',
            'manager_id' => 'nullable|exists:users,id',
            'audience' => 'nullable|string',
            'other_details' => 'nullable|string',
            // front-end uses 'due_date' input name for started_on
            'due_date' => 'nullable|date',
            'in_progress' => 'sometimes|boolean',
            // front-end uses 'image' for logo and 'file' for guideline
            'image' => 'sometimes|file|mimes:jpg,jpeg,png,svg,pdf|max:5120',
            'file' => 'sometimes|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:10240',
        ]);

        // Update simple fields
        $brand->fill([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'audience' => $validated['audience'] ?? null,
            'other_details' => $validated['other_details'] ?? null,
            'client_id' => $validated['client_id'],
            // map front-end due_date -> started_on db column
            'started_on' => $validated['due_date'] ?? null,
            'in_progress' => $request->has('in_progress') ? (bool) $validated['in_progress'] : $brand->in_progress,
        ]);

        // Handle logo upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            // remove old logo if exists
            if ($brand->logo_path && Storage::disk('public')->exists($brand->logo_path)) {
                Storage::disk('public')->delete($brand->logo_path);
            }
            $path = $file->store('brands/' .
                now()->format('Ymd') . '/logos', 'public');
            $brand->logo_path = $path;
        }

        // Handle guideline file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            if ($brand->file_path && Storage::disk('public')->exists($brand->file_path)) {
                Storage::disk('public')->delete($brand->file_path);
            }
            $path = $file->store('brands/' .
                now()->format('Ymd') . '/guideline', 'public');
            $brand->file_path = $path;
        }

        $brand->save();

        // Handle manager reassignment (admin only path)
        if ($request->filled('manager_id')) {
            $manager = User::find($validated['manager_id']);

            if (!$manager->getRoleNames()->map(fn($role) => strtolower($role))->contains('manager')) {
                return redirect()->route('brands.index')
                    ->with('error', 'Selected user is not a manager.');
            }

            $brand->managers()->sync([$manager->id]);
        } elseif ($request->has('manager_id')) {
            // Explicit empty selection removes managers
            $brand->managers()->detach();
        }

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
                $query->whereRaw('LOWER(name) = ?', ['manager']);
            })
            ->get();

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

        if (!$brand->logo_path || !Storage::disk('public')->exists($brand->logo_path)) {
            abort(404);
        }

        return response()->file(storage_path('app/public/' . $brand->logo_path));
    }

    /**
     * Serve the brand guideline file securely from public storage (as download).
     */
    public function guideline(Brand $brand)
    {
        $this->authorize('view', $brand);

        if (!$brand->file_path || !Storage::disk('public')->exists($brand->file_path)) {
            abort(404);
        }

        $filename = basename($brand->file_path);

        // Use response()->download to serve files from storage for compatibility
        $full = storage_path('app/public/' . $brand->file_path);
        return response()->download($full, $filename);
    }

    /**
     * Resolve the set of client IDs a manager should be associated with.
     */
    protected function resolveManagerClientIds(User $user): array
    {
        $clientIds = collect();

        if (!empty($user->email)) {
            $clientIds = $clientIds->merge(
                Client::where('contact_email', $user->email)->pluck('id')
            );
        }

        $clientIds = $clientIds->merge(
            Client::where('created_by', $user->id)->pluck('id')
        );

        $clientIds = $clientIds->merge(
            Brand::whereHas('managers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->whereNotNull('client_id')->pluck('client_id')
        );

        return $clientIds->filter()->unique()->values()->all();
    }
}
