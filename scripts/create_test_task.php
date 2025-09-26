<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Task;
use Illuminate\Support\Str;

$task = Task::create([
    'name' => 'Test Insert',
    'description' => 'Inserted by script',
    'status' => 'Inactive',
    'priority' => 'medium',
    'due_date' => null,
    'assigned_user_id' => 2,
    'created_by' => 1,
    'updated_by' => 1,
    'project_id' => 8,
    'brand_id' => 8,
]);

echo "Created task id: {$task->id}\n";
