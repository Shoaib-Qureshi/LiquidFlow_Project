<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Subscription;
use App\Models\WooCommerceOrder;

$ids = $argv;
array_shift($ids);

if (empty($ids)) {
    echo "Usage: php scripts/remove_order.php order_id [order_id ...]" . PHP_EOL;
    exit(1);
}

foreach ($ids as $id) {
    Subscription::where('external_reference', 'woo-order:' . $id)->delete();
    WooCommerceOrder::where('woocommerce_order_id', $id)->delete();
    echo "Removed local records for order {$id}" . PHP_EOL;
}
