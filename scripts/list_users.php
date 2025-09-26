<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::all();
foreach ($users as $u) {
    echo "{$u->id}: {$u->email} | name: {$u->name} | roles: " . implode(',', $u->roles->pluck('name')->toArray()) . "\n";
}
