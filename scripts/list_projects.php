<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

$projects = Project::with('tasks')->orderBy('id')->get();
if ($projects->isEmpty()) {
    echo "No projects found\n";
    exit;
}
foreach ($projects as $p) {
    echo "{$p->id} | {$p->name} | status: {$p->status} | tasks: " . $p->tasks->count() . "\n";
}
