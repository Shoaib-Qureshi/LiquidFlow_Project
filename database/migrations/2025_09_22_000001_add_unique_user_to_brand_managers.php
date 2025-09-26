<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brand_managers', function (Blueprint $table) {
            // Ensure a manager (user_id) can be assigned to only one brand
            // First drop any existing non-unique index if present (safe for sqlite)
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('brand_managers', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });
    }
};
