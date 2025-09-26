<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('tasks')
            ->where('status', 'pending')
            ->update(['status' => 'Inactive']);

        DB::table('tasks')
            ->where('status', 'in_progress')
            ->update(['status' => 'Active']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('tasks')
            ->where('status', 'Inactive')
            ->update(['status' => 'pending']);

        DB::table('tasks')
            ->where('status', 'Active')
            ->update(['status' => 'in_progress']);
    }
};
