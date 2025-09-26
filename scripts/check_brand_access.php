<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;
use App\Models\User;

$brand = Brand::first();
if (!$brand) {
    echo "No brands found\n";
    exit;
}

$users = User::all();
foreach ($users as $u) {
    $canView = false;
    if ($u->hasRole('Admin')) $canView = true;
    elseif ($u->hasRole('Manager')) {
        $canView = $brand->managers()->where('user_id', $u->id)->exists();
    } else {
        $canView = $brand->teamUsers()->where('user_id', $u->id)->exists();
    }
    echo "User {$u->email} roles: " . implode(',', $u->roles->pluck('name')->toArray()) . " => canViewBrand: " . ($canView ? 'yes' : 'no') . "\n";
}
