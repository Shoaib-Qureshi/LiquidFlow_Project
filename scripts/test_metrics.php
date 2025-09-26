<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\DashboardMetricsService;

$svc = new DashboardMetricsService();
try {
    $blocked = $svc->getBlockedTasksStats();
    echo "Blocked tasks count: " . $blocked['count'] . "\n";
    foreach ($blocked['tasks'] as $t) {
        echo "- {$t['id']} {$t['name']} (project:" . ($t['project']['name'] ?? 'none') . ") blocked by: ";
        $names = array_map(function ($b) {
            return $b['name'];
        }, $t['blocked_by']->toArray() ?? []);
        echo implode(', ', $names) . "\n";
    }
} catch (\Exception $e) {
    echo "Exception: " . get_class($e) . " - " . $e->getMessage() . "\n";
}
