<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class PermissionAndTestUsersSeeder extends Seeder
{
    public function run()
    {
        // Define roles and permissions
        $roles = ['Admin', 'Manager', 'TeamUser'];

        $permissions = [
            'view_all_brands',
            'create_brand',
            'edit_brand',
            'delete_brand',
            'assign_brand_manager',
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            'create_task',
            'edit_task',
            'delete_task',
            'assign_task',
            'update_task_status',
            'manage_users',
        ];

        // Create roles
        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r]);
        }
        // Ensure Manager role exists under exact name 'Manager' as well
        Role::firstOrCreate(['name' => 'Manager']);

        // Create permissions
        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p]);
        }

        // Assign all permissions to Admin
        $admin = Role::where('name', 'Admin')->first();
        if ($admin) {
            $admin->givePermissionTo($permissions);
        }

        // Give Manager limited permissions: view projects and create_brand
        $manager = Role::where('name', 'Manager')->first();
        if ($manager) {
            $manager->givePermissionTo(['view projects', 'create_brand']);
        }

        // Create test users
        $accounts = [
            ['name' => 'Admin User', 'email' => 'admin@test.com', 'password' => 'Admin@123', 'role' => 'Admin'],
            ['name' => 'Manager User', 'email' => 'manager@test.com', 'password' => 'Manager@123', 'role' => 'Manager'],
            ['name' => 'Team Member', 'email' => 'team@test.com', 'password' => 'Team@123', 'role' => 'TeamUser'],
        ];

        foreach ($accounts as $acc) {
            $user = User::where('email', $acc['email'])->first();
            if ($user) {
                // Update existing user
                $user->name = $acc['name'];
                $user->password = Hash::make($acc['password']);
                $user->email_verified_at = now();
                $user->save();
            } else {
                $user = User::create([
                    'name' => $acc['name'],
                    'email' => $acc['email'],
                    'password' => Hash::make($acc['password']),
                    'email_verified_at' => now(),
                ]);
            }

            if (!$user->hasRole($acc['role'])) {
                $user->assignRole($acc['role']);
            }
        }
    }
}
