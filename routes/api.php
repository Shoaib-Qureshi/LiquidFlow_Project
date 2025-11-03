<?php

use App\Http\Controllers\Integrations\WooCommerceOrderController;
use App\Http\Controllers\Integrations\WooCommerceSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::post('/integrations/woocommerce/orders', WooCommerceOrderController::class)
    ->name('integrations.woocommerce.orders.store');

Route::post('/integrations/woocommerce/subscriptions', WooCommerceSubscriptionController::class)
    ->name('integrations.woocommerce.subscriptions.store');
