<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Update permissions to match requirements
        $permissions = [
            // Brand permissions
            'view_all_brands',
            'create_brand',
            'edit_brand',
            'delete_brand',
            'assign_brand_manager',

            // Task permissions
            'create_task',
            'edit_task',
            'delete_task',
            'assign_task',
            'update_task_status',
            'view_assigned_tasks',

            // User management
            'manage_users',
        ];

        // Create missing permissions
        foreach ($permissions as $permission) {
            $existing = DB::table('permissions')->where('name', $permission)->first();
            if (!$existing) {
                DB::table('permissions')->insert([
                    'name' => $permission,
                    'guard_name' => 'web',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Get role IDs
        $adminRole = DB::table('roles')->where('name', 'Admin')->first();
        $managerRole = DB::table('roles')->where('name', 'Manager')->first();
        $teamUserRole = DB::table('roles')->where('name', 'TeamUser')->first();

        if (!$adminRole || !$managerRole || !$teamUserRole) {
            return; // Roles don't exist yet, skip this migration
        }

        // Get permission IDs
        $allPermissions = DB::table('permissions')->get();

        // Assign all permissions to admin
        foreach ($allPermissions as $permission) {
            $existing = DB::table('role_has_permissions')
                ->where('permission_id', $permission->id)
                ->where('role_id', $adminRole->id)
                ->first();

            if (!$existing) {
                DB::table('role_has_permissions')->insert([
                    'permission_id' => $permission->id,
                    'role_id' => $adminRole->id,
                ]);
            }
        }

        // Assign manager permissions
        $managerPermissions = [
            'view_all_brands',
            'create_task',
            'edit_task',
            'delete_task',
            'assign_task',
            'update_task_status',
        ];

        foreach ($allPermissions as $permission) {
            if (in_array($permission->name, $managerPermissions)) {
                $existing = DB::table('role_has_permissions')
                    ->where('permission_id', $permission->id)
                    ->where('role_id', $managerRole->id)
                    ->first();

                if (!$existing) {
                    DB::table('role_has_permissions')->insert([
                        'permission_id' => $permission->id,
                        'role_id' => $managerRole->id,
                    ]);
                }
            }
        }

        // Assign team user permissions
        $teamUserPermissions = [
            'update_task_status',
            'view_assigned_tasks',
        ];

        foreach ($allPermissions as $permission) {
            if (in_array($permission->name, $teamUserPermissions)) {
                $existing = DB::table('role_has_permissions')
                    ->where('permission_id', $permission->id)
                    ->where('role_id', $teamUserRole->id)
                    ->first();

                if (!$existing) {
                    DB::table('role_has_permissions')->insert([
                        'permission_id' => $permission->id,
                        'role_id' => $teamUserRole->id,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration only adds permissions, so down() is empty
        // The original migration handles dropping tables
    }
};
