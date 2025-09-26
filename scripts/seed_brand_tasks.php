<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Brand;
use App\Models\Task;

$brands = Brand::orderBy('id')->get();
if ($brands->isEmpty()) {
    echo "No brands found to seed\n";
    exit;
}

foreach ($brands as $b) {
    $assignee = $b->managers->first()?->id ?? 1; // fallback to admin
    $task = Task::create([
        'name' => "Sample task for {$b->name}",
        'description' => "Auto-generated sample task",
        'status' => 'Inactive',
        'priority' => 'medium',
        'due_date' => null,
        'assigned_user_id' => $assignee,
        'created_by' => 1,
        'updated_by' => 1,
        'project_id' => $b->id,
        'brand_id' => $b->id,
    ]);
    echo "Created task {$task->id} for brand {$b->id}\n";
}
