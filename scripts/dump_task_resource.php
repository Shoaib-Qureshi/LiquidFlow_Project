<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Models\Task;
use App\Http\Resources\TaskResource;

$id = $argv[1] ?? null;
if (! $id) {
    echo "Usage: php scripts/dump_task_resource.php <task_id>\n";
    exit(1);
}

$task = Task::with(['project', 'brand', 'assignedUser', 'createdBy', 'updatedBy'])->find($id);
if (! $task) {
    echo "Task not found\n";
    exit(1);
}

$request = Request::capture();
$resource = new TaskResource($task);
print_r($resource->toArray($request));
