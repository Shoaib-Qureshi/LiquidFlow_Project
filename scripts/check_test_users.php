<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Role;

$emails = ['admin@test.com', 'manager@test.com', 'team@test.com'];
$users = User::whereIn('email', $emails)->get();
$roles = Role::all()->pluck('name')->toArray();

echo "Available roles: " . implode(', ', $roles) . "\n\n";

foreach ($emails as $email) {
    $user = $users->firstWhere('email', $email);
    if (!$user) {
        echo "User not found: $email\n";
        continue;
    }
    $assigned = $user->roles->pluck('name')->toArray();
    echo "User: {$user->id} | {$user->email} | verified:" . (!is_null($user->email_verified_at) ? 'yes' : 'no') . "\n";
    echo "Roles: " . implode(', ', $assigned) . "\n";
    echo "Password hash: {$user->password}\n";
    echo "\n";
}
