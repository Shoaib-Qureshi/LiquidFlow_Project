<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
    $defaultConnection = config('database.default');
    $driver = config("database.connections.{$defaultConnection}.driver");

    // SQLite doesn't support dropping foreign keys; recreate the table instead
    if ($driver === 'sqlite' || $driver === 'sqlite3' || $driver === 'pdo_sqlite') {
            // Disable FK checks, copy data, recreate table, reinsert
            \DB::statement('PRAGMA foreign_keys=off');

            // Create new table with desired schema
            Schema::create('tasks_new', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->longText('description')->nullable();
                $table->string('image_path')->nullable();
                $table->string('status');
                $table->string('priority');
                $table->string('due_date')->nullable();
                $table->foreignId('assigned_user_id')->constrained('users');
                $table->foreignId('created_by')->constrained('users');
                $table->foreignId('updated_by')->constrained('users');
                // project_id will now reference brands and be nullable
                $table->foreignId('project_id')->nullable()->constrained('brands')->onDelete('set null');
                $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null');
                $table->timestamps();
            });

            // Copy existing rows into new table (preserve ids)
            $rows = \DB::table('tasks')->get();
            foreach ($rows as $row) {
                \DB::table('tasks_new')->insert([
                    'id' => $row->id,
                    'name' => $row->name,
                    'description' => $row->description,
                    'image_path' => $row->image_path,
                    'status' => $row->status,
                    'priority' => $row->priority,
                    'due_date' => $row->due_date,
                    'assigned_user_id' => $row->assigned_user_id,
                    'created_by' => $row->created_by,
                    'updated_by' => $row->updated_by,
                    'project_id' => $row->project_id,
                    'brand_id' => $row->brand_id ?? null,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ]);
            }

            Schema::drop('tasks');
            Schema::rename('tasks_new', 'tasks');

            \DB::statement('PRAGMA foreign_keys=on');
        } else {
            // For other DB drivers we can alter safely
            Schema::table('tasks', function (Blueprint $table) {
                try {
                    $table->dropForeign(['project_id']);
                } catch (\Exception $e) {
                }

                if (Schema::hasColumn('tasks', 'project_id')) {
                    $table->dropColumn('project_id');
                }
            });

            Schema::table('tasks', function (Blueprint $table) {
                $table->foreignId('project_id')->nullable()->constrained('brands')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // drop the brands FK and column
            try {
                $table->dropForeign(['project_id']);
            } catch (\Exception $e) {
            }

            if (Schema::hasColumn('tasks', 'project_id')) {
                $table->dropColumn('project_id');
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            // restore the original relation to projects (non-nullable)
            $table->foreignId('project_id')->constrained('projects');
        });
    }
};
