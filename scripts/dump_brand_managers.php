<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$rows = DB::table('brand_managers')
    ->select('user_id', DB::raw('count(*) as cnt'))
    ->groupBy('user_id')
    ->having('cnt', '>', 1)
    ->get();

if ($rows->isEmpty()) {
    echo "No duplicate manager assignments found.\n";
} else {
    foreach ($rows as $r) {
        echo "user_id {$r->user_id} assigned to {$r->cnt} brands\n";
    }
}
