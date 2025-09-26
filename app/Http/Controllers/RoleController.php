<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware(['role:Admin']);
    }

    public function index()
    {
        $users = User::with('roles')->get();
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return inertia('Role/Index', [
            'users' => $users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ]),
            'roles' => $roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]),
            'permissions' => $permissions->map(fn($permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
            ]),
        ]);
    }

    public function syncUserRoles(Request $request)
    {
        $request->validate([
            'userId' => 'required|exists:users,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::findOrFail($request->userId);
        $user->syncRoles($request->roles);

        return back()->with('success', 'User roles updated successfully.');
    }
}
