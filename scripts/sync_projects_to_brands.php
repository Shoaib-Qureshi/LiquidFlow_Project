<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;
use App\Models\Brand;
use Illuminate\Support\Str;

$projects = Project::all();
if ($projects->isEmpty()) {
    echo "No projects to sync\n";
    exit;
}

foreach ($projects as $p) {
    // Try to find an existing brand by name
    $brand = Brand::where('name', $p->name)->first();
    if (! $brand) {
        $brand = Brand::create([
            'name' => $p->name,
            'description' => $p->description ?? null,
            'status' => in_array($p->status, ['active','inactive']) ? $p->status : 'active',
        ]);
        echo "Created brand {$brand->id} for project {$p->id} ({$p->name})\n";
    } else {
        echo "Found existing brand {$brand->id} for project {$p->id} ({$p->name})\n";
    }

    // Update tasks that referenced the project id to point to the new brand id
    $updated = \App\Models\Task::where('project_id', $p->id)->update([
        'project_id' => $brand->id,
        'brand_id' => $brand->id,
    ]);

    if ($updated) {
        echo "  Updated {$updated} tasks to point to brand {$brand->id}\n";
    }
}

echo "Sync complete.\n";
