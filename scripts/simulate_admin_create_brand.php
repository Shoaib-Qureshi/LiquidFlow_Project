<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;
use App\Models\User;

$admin = User::where('email', 'admin@test.com')->first();
$manager = User::where('email', 'manager@test.com')->first();

if (!$admin || !$manager) {
    echo "Missing admin or manager\n";
    exit(1);
}

// simulate admin creating a brand and assigning manager
$brand = Brand::create(['name' => 'ACME Corp', 'description' => 'ACME brand', 'status' => 'active']);
// check manager has no brand
$existing = Brand::whereHas('managers', function ($q) use ($manager) {
    $q->where('user_id', $manager->id);
})->first();
if ($existing) {
    echo "Manager already has brand\n";
    exit(1);
}
$brand->managers()->attach($manager->id);

echo "Created brand {$brand->id} and assigned manager {$manager->email}\n";
