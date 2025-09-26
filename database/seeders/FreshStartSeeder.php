<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class FreshStartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🧹 Clearing database entries (keeping users and roles)...');

        // Clear all data except users and roles/permissions
        // SQLite compatible way to clear data
        DB::table('task_dependencies')->delete();
        DB::table('comments')->delete();
        DB::table('tasks')->delete();
        DB::table('brand_managers')->delete();
        DB::table('brands')->delete();
        DB::table('projects')->delete();

        $this->command->info('✅ Database cleared successfully!');

        // Ensure we have the basic roles and permissions
        $this->command->info('🔧 Setting up roles and permissions...');
        
        // Clear cached roles and permissions
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

        // Clear all users except the two main ones we want
        $this->command->info('👥 Setting up clean user base...');
        
        // Remove all users first
        User::whereNotIn('email', ['admin@test.com', 'manager@test.com'])->delete();

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
            
            $this->command->info("✅ User created/updated: {$userData['email']} ({$userData['role']})");
        }

        $this->command->info('🎉 Fresh start complete! Your database is clean and ready.');
        $this->command->info('');
        $this->command->info('📝 Login Credentials (Only 2 users):');
        $this->command->info('   Admin: admin@test.com / password');
        $this->command->info('   Manager: manager@test.com / password');
        $this->command->info('');
        $this->command->info('✅ Fixed Issues:');
        $this->command->info('   - Removed extra manager users');
        $this->command->info('   - Fixed 403 authorization errors');
        $this->command->info('   - Clean user base with only 2 accounts');
        $this->command->info('');
        $this->command->info('🚀 You can now start fresh with your improved application!');
    }
}
