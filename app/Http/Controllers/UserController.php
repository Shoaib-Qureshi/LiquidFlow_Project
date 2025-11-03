<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserCrudResource;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Mail\TeamMemberInvite;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = User::query();

        // If current user is a Manager, show only users assigned to brands they manage
        /** @var \App\Models\User $current */
        $current = auth()->user();
        if ($current) {
            $roles = ($current->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
            if ($roles->contains('manager')) {
                $managerBrandIds = \App\Models\Brand::whereHas('managers', function ($q) use ($current) {
                    $q->where('user_id', $current->id);
                })->pluck('id')->toArray();
                $query->whereHas('assignedBrands', function ($q) use ($managerBrandIds) {
                    $q->whereIn('brands.id', $managerBrandIds);
                });
            }
        }

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", "desc");

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("email")) {
            $query->where("email", "like", "%" . request("email") . "%");
        }

        $users = $query->with('assignedBrands')
            ->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->onEachSide(1);

        return inertia("User/Index", [
            "users" => UserCrudResource::collection($users),
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();
        $brands = collect();
        if ($user) {
            $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
            if ($roles->contains('manager')) {
                $brands = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->orderBy('name')->get(['brands.id', 'brands.name']);
            }
        }

        return inertia("User/Create", [
            'brands' => $brands,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $brandIds = $data['brand_ids'] ?? [];
        unset($data['brand_ids']);

        $current = auth()->user();
        $currentRoles = ($current->roles ?? collect())->pluck('name')->map(fn ($r) => strtolower($r));
        $isManagerCreating = $currentRoles->contains('manager');

        $providedPassword = $request->input('password');
        if (! $isManagerCreating && $providedPassword) {
            $plainPassword = $providedPassword;
        } else {
            $plainPassword = Str::password(12);
        }

        $data['email_verified_at'] = now();
        $data['password'] = bcrypt($plainPassword);

        $user = User::create($data);

        // If brand_ids provided, attach to pivot (brand_users)
        if (! empty($brandIds) && is_array($brandIds)) {
            // Ensure current user (creator) can assign these brands
            if ($currentRoles->contains('admin')) {
                $allowed = \App\Models\Brand::whereIn('id', $brandIds)->pluck('id');
            } else {
                $allowed = \App\Models\Brand::whereHas('managers', function ($q) use ($current) {
                    $q->where('user_id', $current->id);
                })->whereIn('brands.id', $brandIds)->pluck('brands.id');
            }
            $user->assignedBrands()->sync($allowed->all());
        }

        // If creator is Manager and this is a team member, assign TeamUser role
        if ($currentRoles->contains('manager')) {
            $user->assignRole('TeamUser');
        }

        Mail::to($user->email)->send(new TeamMemberInvite($user, $plainPassword));

        return to_route('user.index')
            ->with('success', 'User was created');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $current = auth()->user();
        $brands = collect();
        if ($current) {
            $currentRoles = ($current->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
            if ($currentRoles->contains('manager')) {
                $brands = \App\Models\Brand::whereHas('managers', function ($q) use ($current) {
                    $q->where('user_id', $current->id);
                })->orderBy('name')->get(['brands.id', 'brands.name']);
            }
        }

        // load assigned brand ids
        $user->load('assignedBrands');

        return inertia('User/Edit', [
            'user' => new UserCrudResource($user),
            'brands' => $brands,
            'assigned_brand_ids' => $user->assignedBrands->pluck('id'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        $password = $data['password'] ?? null;
        if ($password) {
            $data['password'] = bcrypt($password);
        } else {
            unset($data['password']);
        }
        $user->update($data);

        // Handle brand assignments
        if (array_key_exists('brand_ids', $data)) {
            $current = auth()->user();
            $requested = is_array($data['brand_ids']) ? $data['brand_ids'] : [];
            $currentRoles = ($current->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
            if ($currentRoles->contains('admin')) {
                $allowed = \App\Models\Brand::whereIn('id', $requested)->pluck('id');
            } else {
                $allowed = \App\Models\Brand::whereHas('managers', function ($q) use ($current) {
                    $q->where('user_id', $current->id);
                })->whereIn('brands.id', $requested)->pluck('brands.id');
            }
            $user->assignedBrands()->sync($allowed->all());
        }

        return to_route('user.index')
            ->with('success', "User \"$user->name\" was updated");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $name = $user->name;
        $user->delete();
        return to_route('user.index')
            ->with('success', "User \"$name\" was deleted");
    }
}
