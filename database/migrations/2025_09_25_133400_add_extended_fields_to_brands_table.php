<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'audience')) {
                $table->text('audience')->nullable();
            }
            if (!Schema::hasColumn('brands', 'other_details')) {
                $table->text('other_details')->nullable();
            }
            if (!Schema::hasColumn('brands', 'started_on')) {
                $table->date('started_on')->nullable();
            }
            if (!Schema::hasColumn('brands', 'in_progress')) {
                $table->boolean('in_progress')->default(false);
            }
            if (!Schema::hasColumn('brands', 'logo_path')) {
                $table->string('logo_path')->nullable();
            }
            if (!Schema::hasColumn('brands', 'file_path')) {
                $table->string('file_path')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (Schema::hasColumn('brands', 'audience')) {
                $table->dropColumn('audience');
            }
            if (Schema::hasColumn('brands', 'other_details')) {
                $table->dropColumn('other_details');
            }
            if (Schema::hasColumn('brands', 'started_on')) {
                $table->dropColumn('started_on');
            }
            if (Schema::hasColumn('brands', 'in_progress')) {
                $table->dropColumn('in_progress');
            }
            if (Schema::hasColumn('brands', 'logo_path')) {
                $table->dropColumn('logo_path');
            }
            if (Schema::hasColumn('brands', 'file_path')) {
                $table->dropColumn('file_path');
            }
        });
    }
};
