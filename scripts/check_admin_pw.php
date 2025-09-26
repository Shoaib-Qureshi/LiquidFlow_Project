<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$u = User::where('email', 'admin@test.com')->first();
if (!$u) {
    echo "Admin not found\n";
    exit(1);
}

echo "Admin id={$u->id}\n";
if (Hash::check('Admin@123', $u->password)) {
    echo "Password OK\n";
} else {
    echo "Password mismatch\n";
}
