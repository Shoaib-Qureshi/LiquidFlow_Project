<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

$accounts = [
    [
        'name' => 'Admin User',
        'email' => 'admin@test.com',
        'password' => 'Admin@123',
        'role' => 'Admin'
    ],
    [
        'name' => 'Manager User',
        'email' => 'manager@test.com',
        'password' => 'Manager@123',
        'role' => 'Manager'
    ],
    [
        'name' => 'Team Member',
        'email' => 'team@test.com',
        'password' => 'Team@123',
        'role' => 'Team Member'
    ]
];

foreach ($accounts as $acc) {
    // Ensure role exists - map 'Team Member' to internal 'TeamUser' role name
    $roleName = $acc['role'] === 'Team Member' ? 'TeamUser' : $acc['role'];

    // Create the role if it doesn't exist
    $existingRole = Role::where('name', $roleName)->first();
    if (!$existingRole) {
        Role::create(['name' => $roleName]);
        echo "Created role: {$roleName}\n";
    }

    $user = User::where('email', $acc['email'])->first();
    if ($user) {
        $user->password = Hash::make($acc['password']);
        $user->email_verified_at = now();
        $user->name = $acc['name'];
        $user->save();
        echo "Updated user: {$acc['email']}\n";
    } else {
        $user = User::create([
            'name' => $acc['name'],
            'email' => $acc['email'],
            'password' => Hash::make($acc['password']),
            'email_verified_at' => now(),
        ]);
        echo "Created user: {$acc['email']} (id={$user->id})\n";
    }

    // Assign role
    $role = Role::where('name', $roleName)->first();
    if ($role && !$user->hasRole($role)) {
        $user->assignRole($role);
        echo "Assigned role {$roleName} to user {$acc['email']}\n";
    }
}

echo "\nLogin credentials for test users:\n";
foreach ($accounts as $acc) {
    echo "\n{$acc['role']}:\n";
    echo "Email: {$acc['email']}\n";
    echo "Password: {$acc['password']}\n";
}
