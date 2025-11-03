<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Subscription;

$ids = $argv;
array_shift($ids);

if (empty($ids)) {
    echo "Usage: php scripts/cleanup_orders.php order_id [order_id ...]" . PHP_EOL;
    exit(1);
}

$refs = array_map(fn ($id) => "woo-order:" . $id, $ids);

Subscription::whereIn('external_reference', $refs)->update([
    'status' => Subscription::STATUS_CANCELLED,
    'cancelled_at' => now(),
]);

echo "Marked as cancelled: " . implode(', ', $ids) . PHP_EOL;
