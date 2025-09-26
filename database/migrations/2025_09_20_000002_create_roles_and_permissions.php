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

        // First ensure the tables exist
        Schema::create('roles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('guard_name')->default('web');
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('guard_name')->default('web');
            $table->timestamps();
        });

        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('role_id');

            $table->foreign('permission_id')
                ->references('id')
                ->on('permissions')
                ->onDelete('cascade');
            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->onDelete('cascade');

            $table->primary(['permission_id', 'role_id']);
        });

        Schema::create('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');

            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->onDelete('cascade');

            $table->primary(['role_id', 'model_id', 'model_type']);
        });

        Schema::create('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');

            $table->foreign('permission_id')
                ->references('id')
                ->on('permissions')
                ->onDelete('cascade');

            $table->primary(['permission_id', 'model_id', 'model_type']);
        });

        // Create roles
        DB::table('roles')->insert([
            ['name' => 'Admin', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Manager', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'TeamUser', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Create permissions
        $permissions = [
            'view_all_brands',
            'create_brand',
            'edit_brand',
            'delete_brand',
            'assign_brand_manager',
            'create_task',
            'edit_task',
            'delete_task',
            'assign_task',
            'update_task_status',
            'manage_users',
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->insert([
                'name' => $permission,
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Get role IDs
        $adminRole = DB::table('roles')->where('name', 'Admin')->first();
        $managerRole = DB::table('roles')->where('name', 'Manager')->first();
        $teamUserRole = DB::table('roles')->where('name', 'TeamUser')->first();

        // Get permission IDs
        $allPermissions = DB::table('permissions')->get();

        // Assign all permissions to admin
        foreach ($allPermissions as $permission) {
            DB::table('role_has_permissions')->insert([
                'permission_id' => $permission->id,
                'role_id' => $adminRole->id,
            ]);
        }

        // Assign manager permissions
        $managerPermissions = [
            'create_task',
            'edit_task',
            'delete_task',
            'assign_task',
            'update_task_status',
        ];

        foreach ($allPermissions as $permission) {
            if (in_array($permission->name, $managerPermissions)) {
                DB::table('role_has_permissions')->insert([
                    'permission_id' => $permission->id,
                    'role_id' => $managerRole->id,
                ]);
            }
        }

        // Assign team user permissions
        $updateTaskStatus = DB::table('permissions')
            ->where('name', 'update_task_status')
            ->first();

        DB::table('role_has_permissions')->insert([
            'permission_id' => $updateTaskStatus->id,
            'role_id' => $teamUserRole->id,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('permissions');
    }
};
