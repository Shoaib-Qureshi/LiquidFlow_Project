<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$config = config('services.woocommerce');
$baseUrl = rtrim($config['api_url'] ?? '', '/');
$key = $config['key'] ?? null;
$secret = $config['secret'] ?? null;

if (! $baseUrl || ! $key || ! $secret) {
    fwrite(STDERR, "WooCommerce API credentials missing.\n");
    exit(1);
}

$http = \Illuminate\Support\Facades\Http::withBasicAuth($key, $secret)
    ->baseUrl($baseUrl)
    ->acceptJson()
    ->asJson()
    ->withOptions(['timeout' => (int) ($config['timeout'] ?? 30)]);

$ids = $argv;
array_shift($ids);

if (empty($ids)) {
    echo "Provide order IDs\n";
    exit(1);
}

foreach ($ids as $id) {
    try {
        $response = $http->get("orders/{$id}");
        if ($response->failed()) {
            throw new RuntimeException($response->body(), $response->status());
        }
        $order = $response->json();
        echo "Order {$id}: status={$order['status']} total={$order['total']}\n";
    } catch (Throwable $e) {
        echo "Order {$id}: ERROR ".$e->getMessage()."\n";
    }
}
