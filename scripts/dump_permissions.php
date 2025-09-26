<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Permission;

$perms = Permission::all()->pluck('name')->toArray();

echo "Permissions (count=" . count($perms) . "):\n";
foreach ($perms as $p) {
    echo "- {$p}\n";
}
