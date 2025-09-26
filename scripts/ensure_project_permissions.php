<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

$needed = [
    'view projects',
    'create projects',
    'edit projects',
    'delete projects',
];

foreach ($needed as $p) {
    $perm = Permission::firstOrCreate(['name' => $p]);
    echo ($perm->wasRecentlyCreated ? "Created permission: {$p}\n" : "Exists: {$p}\n");
}

$admin = Role::where('name', 'Admin')->first();
if ($admin) {
    $admin->givePermissionTo($needed);
    echo "Assigned project permissions to Admin role\n";
} else {
    echo "Admin role not found, skipping assignment\n";
}
