<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Auth;
use App\Models\User;

function attempt($email, $password)
{
    $credentials = ['email' => $email, 'password' => $password];
    if (Auth::attempt($credentials)) {
        echo "Login success: $email\n";
        Auth::logout();
    } else {
        echo "Login failed: $email\n";
    }
}

attempt('admin@test.com', 'Admin@123');
attempt('manager@test.com', 'Manager@123');
attempt('team@test.com', 'Team@123');
