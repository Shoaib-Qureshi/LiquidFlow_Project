<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Role;

$role = Role::where('name', 'Manager')->first();
if (!$role) {
    echo "Manager role not found\n";
    exit;
}

echo "Manager permissions: " . implode(',', $role->permissions->pluck('name')->toArray()) . "\n";
