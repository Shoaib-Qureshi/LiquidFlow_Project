<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$orders = \App\Models\WooCommerceOrder::orderBy('woocommerce_order_id')
    ->get(['woocommerce_order_id', 'status']);

echo $orders->toJson(JSON_PRETTY_PRINT).PHP_EOL;
