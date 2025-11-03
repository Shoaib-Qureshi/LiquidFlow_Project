<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\WooCommerceOrder;
use App\Jobs\Integrations\ProcessWooCommerceOrder;

$ids = $argv;
array_shift($ids);

if (empty($ids)) {
    echo "Usage: php scripts/resync_orders.php order_id [order_id ...]" . PHP_EOL;
    exit(1);
}

foreach ($ids as $id) {
    $order = WooCommerceOrder::where('woocommerce_order_id', $id)->first();

    if (! $order) {
        echo "Order {$id}: not found in local database." . PHP_EOL;
        continue;
    }

    $payload = $order->payload;

    if (! is_array($payload)) {
        echo "Order {$id}: payload missing." . PHP_EOL;
        continue;
    }

    ProcessWooCommerceOrder::dispatchSync($payload);
    echo "Order {$id}: re-synced." . PHP_EOL;
}
