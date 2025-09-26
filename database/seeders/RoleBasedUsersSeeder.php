<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleBasedUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create manager users
        for ($i = 1; $i <= 3; $i++) {
            $manager = User::create([
                'name' => "Manager {$i}",
                'email' => "manager{$i}@example.com",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $manager->assignRole('Manager');
        }

        // Create team users
        for ($i = 1; $i <= 5; $i++) {
            $teamUser = User::create([
                'name' => "Team User {$i}",
                'email' => "team{$i}@example.com",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $teamUser->assignRole('TeamUser');
        }
    }
}
