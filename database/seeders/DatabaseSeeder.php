<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the unified seeder for roles, permissions, and test users
        $this->call([
            UnifiedRoleAndUserSeeder::class,
            BrandSeeder::class
        ]);

        // Create additional test data
        User::factory(5)->create();
        Project::factory(10)->create();

        Project::factory()
            ->count(20)
            ->hasTasks(20)
            ->create();
    }
}
