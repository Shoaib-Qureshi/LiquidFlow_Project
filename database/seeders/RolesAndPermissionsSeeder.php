<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('Admin');

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
