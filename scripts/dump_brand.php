<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;

$b = Brand::with(['managers', 'teamUsers', 'tasks'])->find(8);
if (! $b) {
    echo "Brand not found\n";
    exit;
}
print_r($b->toArray());
