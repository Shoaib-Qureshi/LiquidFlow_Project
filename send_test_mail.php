<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Bootstrap the application like artisan does
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Use facades
use Illuminate\Support\Facades\Mail;
use App\Mail\NewBrandCreated;
use App\Models\Project;

$project = Project::first();
if (! $project) {
    echo "No Project found in DB\n";
    exit(1);
}

try {
    Mail::to('shoaib@tier2.digital')->send(new NewBrandCreated($project));
    echo "Mail send attempted\n";
} catch (Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
