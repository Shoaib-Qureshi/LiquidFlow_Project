<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Role;

// Ensure roles exist
foreach (['Admin', 'Manager', 'TeamUser'] as $r) {
    Role::firstOrCreate(['name' => $r, 'guard_name' => 'web']);
}

$managers = [
    ['name' => 'Manager One', 'email' => 'manager1@test.com', 'password' => 'Manager@123'],
    ['name' => 'Manager Two', 'email' => 'manager2@test.com', 'password' => 'Manager@123'],
];

foreach ($managers as $m) {
    $user = User::firstOrNew(['email' => $m['email']]);
    $user->name = $m['name'];
    $user->password = bcrypt($m['password']);
    $user->email_verified_at = $user->email_verified_at ?? now();
    $user->save();

    if (! $user->hasRole('Manager')) {
        $user->assignRole('Manager');
    }

    echo "Ensured manager: {$user->email}\n";
}

echo "Done.\n";
