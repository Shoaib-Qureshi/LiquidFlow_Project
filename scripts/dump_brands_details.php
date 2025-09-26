<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;

$brands = Brand::with(['managers', 'tasks'])->orderBy('id')->get();
if ($brands->count() === 0) {
    echo "No brands found\n";
    exit;
}
foreach ($brands as $b) {
    $managers = $b->managers->pluck('email')->join(', ') ?: 'none';
    $tasksCount = $b->tasks->count();
    echo "{$b->id} | {$b->name} | status: {$b->status} | managers: {$managers} | tasks: {$tasksCount}\n";
}
