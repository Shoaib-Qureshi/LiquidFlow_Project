<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('status');
                // Note: Adding a foreign key in SQLite via alter may not be supported; skip constraint for portability
                // If you want FK in MySQL/Postgres, uncomment the next line:
                // $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (Schema::hasColumn('brands', 'created_by')) {
                // Drop FK first if it was created (skipped above for portability)
                // $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
        });
    }
};
