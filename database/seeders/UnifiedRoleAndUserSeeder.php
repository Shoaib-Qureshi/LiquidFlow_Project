<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UnifiedRoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view_all_brands',
            'view_assigned_brands',
            'create_brand',
            'edit_brand',
            'delete_brand',
            'assign_brand_manager',
            'create_task',
            'edit_task',
            'delete_task',
            'assign_task',
            'update_task_status',
            'view_all_tasks',
            'view_assigned_tasks',
            'manage_users',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $managerRole = Role::firstOrCreate(['name' => 'Manager']);

        // Assign permissions to Admin (all permissions)
        $adminRole->givePermissionTo($permissions);

        // Assign permissions to Manager
        $managerPermissions = [
            'view_assigned_brands',
            'create_brand',
            'edit_brand',
            'create_task',
            'edit_task',
            'delete_task',
            'assign_task',
            'update_task_status',
            'view_all_tasks',
        ];
        $managerRole->givePermissionTo($managerPermissions);

        // Create test users with the exact credentials requested
        $testUsers = [
            [
                'name' => 'Admin User',
                'email' => 'admin@test.com',
                'password' => 'password',
                'role' => 'Admin'
            ],
            [
                'name' => 'Manager User',
                'email' => 'manager@test.com',
                'password' => 'password',
                'role' => 'Manager'
            ],
        ];

        foreach ($testUsers as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'email_verified_at' => now(),
                ]
            );

            // Remove all existing roles and assign the correct one
            $user->syncRoles([$userData['role']]);
        }

        // Create additional manager users for testing
        for ($i = 1; $i <= 5; $i++) {
            $manager = User::updateOrCreate(
                ['email' => "manager{$i}@example.com"],
                [
                    'name' => "Manager {$i}",
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $manager->syncRoles(['Manager']);
        }

        $this->command->info('Unified roles, permissions, and test users created successfully!');
    }
}
