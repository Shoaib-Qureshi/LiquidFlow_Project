<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$subs = \App\Models\Subscription::orderBy('id')
    ->get(['id', 'external_reference', 'status']);

echo $subs->toJson(JSON_PRETTY_PRINT).PHP_EOL;
