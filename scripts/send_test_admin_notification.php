<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Mail\NewBrandCreated;
use App\Services\GmailApiService;
use App\Models\Project;
use App\Helpers\AdminNotifier;

// Boot the framework
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Create a dummy Project instance without persisting
$project = new Project(["name" => "Manual Test Brand"]);

$admins = AdminNotifier::adminEmails();
$mailer = new GmailApiService();

foreach ($admins as $admin) {
    $mailable = new NewBrandCreated($project);
    try {
        $html = $mailable->render();
    } catch (Exception $e) {
        $html = "New brand created: " . ($project->name ?? '');
    }

    // Try to get subject
    try {
        $subject = $mailable->build()->subject ?? 'New Brand Created';
    } catch (Exception $e) {
        $subject = 'New Brand Created';
    }

    try {
        $resp = $mailer->sendRawMessage($admin, $subject, $html);
        echo "Sent to {$admin}: " . json_encode($resp) . "\n";
    } catch (Exception $e) {
        echo "Failed to send to {$admin}: " . $e->getMessage() . "\n";
    }
}

echo "done\n";
