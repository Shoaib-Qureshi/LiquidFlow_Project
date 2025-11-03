<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$router = $app->make(Illuminate\Routing\Router::class);
$route = $router->getRoutes()->getByName('user.index');
if (! $route) {
      echo "route not found\n";
      exit(1);
}
print_r($route->middleware());
