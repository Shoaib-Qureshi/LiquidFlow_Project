<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;
use App\Models\User;

// Find an admin or fallback to first user
$admin = User::where('email', 'admin@test.com')->first() ?? User::first();
if (! $admin) {
    echo "No users found to set as created_by. Create users first.\n";
    exit(1);
}

// Find a manager to attach
$manager = User::role('Manager')->first();
if (! $manager) {
    echo "No manager users found. Run scripts/add_dummy_managers.php first.\n";
}

$brandsData = [
    ['name' => 'Acme Brands', 'description' => 'Dummy brand Acme', 'status' => 'active'],
    ['name' => 'Beta Co', 'description' => 'Dummy brand Beta', 'status' => 'active'],
];

foreach ($brandsData as $b) {
    $brand = Brand::firstOrCreate([
        'name' => $b['name']
    ], [
        'description' => $b['description'],
        'status' => $b['status'],
    ]);

    echo "Ensured brand: {$brand->id} | {$brand->name}\n";

    if ($manager) {
        // Find a manager who doesn't already manage a brand
        $availableManager = App\Models\User::role('Manager')->get()->first(function($m) use ($brand) {
            return ! \App\Models\Brand::whereHas('managers', function($q) use ($m) { $q->where('user_id', $m->id); })->exists();
        });

        if ($availableManager) {
            $brand->managers()->attach($availableManager->id);
            echo "  Attached manager {$availableManager->email}\n";
        } else {
            echo "  No available manager to attach (all managers already assigned).\n";
        }
    }
}

echo "Done.\n";
