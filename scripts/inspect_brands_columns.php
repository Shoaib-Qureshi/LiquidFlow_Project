<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$schema = $app->make(Illuminate\Database\Schema\SqlServerBuilder::class) ?? null;

use Illuminate\Support\Facades\Schema;

$columns = Schema::getColumnListing('brands');
echo "brands columns:\n";
print_r($columns);
