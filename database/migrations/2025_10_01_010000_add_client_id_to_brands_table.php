<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'client_id')) {
                $table->foreignId('client_id')
                    ->nullable()
                    ->after('status')
                    ->constrained('clients')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (Schema::hasColumn('brands', 'client_id')) {
                $table->dropForeign(['client_id']);
                $table->dropColumn('client_id');
            }
        });
    }
};
