<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
      public function up(): void
      {
            // Drop the unique index that restricted a manager (user_id) to only one brand.
            // Different DB engines require different SQL; attempt the appropriate statement.
            try {
                  $driver = DB::getDriverName();
                  if ($driver === 'sqlite') {
                        DB::statement('DROP INDEX IF EXISTS brand_managers_user_id_unique');
                  } elseif ($driver === 'pgsql') {
                        DB::statement('DROP INDEX IF EXISTS brand_managers_user_id_unique');
                  } else {
                        // mysql
                        DB::statement('ALTER TABLE brand_managers DROP INDEX brand_managers_user_id_unique');
                  }
            } catch (\Throwable $e) {
                  // If the index doesn't exist or the statement failed, ignore to avoid blocking deploy
            }
      }

      public function down(): void
      {
            // Recreate the unique index on user_id (restore previous restriction)
            Schema::table('brand_managers', function (Blueprint $table) {
                  $table->unique('user_id');
            });
      }
};
