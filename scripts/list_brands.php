<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;

$brands = Brand::orderBy('id')->get();
if ($brands->count() === 0) {
    echo "No brands found\n";
} else {
    foreach ($brands as $b) {
        echo "{$b->id} | {$b->name}\n";
    }
}
