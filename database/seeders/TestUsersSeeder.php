<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create test users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('Admin@123'),
            'email_verified_at' => now(),
        ]);

        $manager = User::create([
            'name' => 'Manager User',
            'email' => 'manager@test.com',
            'password' => Hash::make('Manager@123'),
            'email_verified_at' => now(),
        ]);

        $teamMember = User::create([
            'name' => 'Team Member',
            'email' => 'team@test.com',
            'password' => Hash::make('Team@123'),
            'email_verified_at' => now(),
        ]);

        // Assign roles
        $admin->assignRole('Admin');
        $manager->assignRole('Manager');
        $teamMember->assignRole('Team Member');
    }
}
