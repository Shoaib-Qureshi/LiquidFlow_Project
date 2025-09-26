<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Models\Project;
use App\Models\Task;
use App\Models\Comment;
use Illuminate\Support\Facades\Artisan;

// Boot the framework
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Create project
$p = Project::factory()->create(['name' => 'Script Brand', 'created_by' => 1, 'updated_by' => 1]);
// Create task
$t = Task::factory()->create(['name' => 'Script Task', 'project_id' => $p->id, 'created_by' => 1, 'updated_by' => 1]);
// Create comment
$c = Comment::create(['task_id' => $t->id, 'user_id' => 1, 'comment' => 'Script comment']);

echo "done\n";
