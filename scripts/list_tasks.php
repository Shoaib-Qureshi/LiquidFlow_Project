<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Task;

$tasks = Task::orderBy('id')->get();
if ($tasks->isEmpty()) {
    echo "No tasks found\n";
    exit;
}
foreach ($tasks as $t) {
    echo "{$t->id} | {$t->name} | brand_id: {$t->brand_id} | project_id: {$t->project_id}\n";
}
