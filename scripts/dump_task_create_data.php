<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;
use App\Models\User;

$user = User::where('email','admin@test.com')->first();
echo "Current user: " . ($user?->email ?? 'none') . PHP_EOL;

$brands = Brand::orderBy('name','asc')->get();
echo "Brands found: " . $brands->count() . PHP_EOL;
$projects = $brands->map(function($brand){
    return [
        'id' => $brand->id,
        'name' => $brand->name,
        'description' => $brand->description ?? '',
        'type' => 'brand'
    ];
});
echo json_encode($projects->toArray(), JSON_PRETTY_PRINT) . PHP_EOL;

// test preselectedBrandId logic when brand_id param present via $_GET
$preselected = null;
if (isset($argv[1])) {
    $candidate = (int)$argv[1];
    if (Brand::whereKey($candidate)->exists()) {
        $preselected = $candidate;
    }
}
echo "preselectedBrandId: " . ($preselected ?? 'null') . PHP_EOL;
