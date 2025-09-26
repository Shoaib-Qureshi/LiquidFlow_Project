<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Role;

echo "\n--- Roles in system ---\n";
foreach (Role::all() as $role) {
    echo "- " . $role->name . "\n";
}

$admin = User::where('email', 'admin@test.com')->first();
if (! $admin) {
    echo "\nAdmin user admin@test.com not found.\n";
} else {
    echo "\nAdmin user found: {$admin->email} (id={$admin->id})\n";
    $roles = method_exists($admin, 'getRoleNames') ? $admin->getRoleNames()->toArray() : [];
    echo "Roles: " . json_encode($roles) . "\n";
    $perms = method_exists($admin, 'getAllPermissions') ? $admin->getAllPermissions()->pluck('name')->toArray() : [];
    echo "Permissions: " . json_encode($perms) . "\n";
}

echo "\n--- Managers in DB (count and sample) ---\n";
$managers = User::role('Manager')->get(['id', 'name', 'email']);
echo "Manager count: " . $managers->count() . "\n";
foreach ($managers as $m) {
    echo "* {$m->id} - {$m->email} ({$m->name})\n";
}

echo "\nDone.\n";
