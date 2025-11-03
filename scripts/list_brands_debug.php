<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;

$brands = Brand::orderBy('id')->get(['id', 'name', 'started_on', 'file_path', 'logo_path', 'audience', 'other_details']);
foreach ($brands as $b) {
    echo "ID: {$b->id}\n";
    echo "Name: {$b->name}\n";
    echo "Started On: " . ($b->started_on ? $b->started_on->toDateString() : 'NULL') . "\n";
    echo "File path: " . ($b->file_path ?? 'NULL') . "\n";
    echo "Logo path: " . ($b->logo_path ?? 'NULL') . "\n";
    echo "Audience: " . ($b->audience ?? 'NULL') . "\n";
    echo "Other details: " . ($b->other_details ?? 'NULL') . "\n";
    echo "-----------------------------\n";
}
