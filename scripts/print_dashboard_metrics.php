<?php
// boots the Laravel app and prints the DashboardMetricsService project stats
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$svc = app(App\Services\DashboardMetricsService::class);
echo json_encode($svc->getProjectStats(), JSON_PRETTY_PRINT) . PHP_EOL;
