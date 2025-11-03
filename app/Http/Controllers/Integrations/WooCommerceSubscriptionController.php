<?php

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Http\Requests\Integrations\StoreWooCommerceSubscriptionRequest;
use App\Jobs\Integrations\ProcessWooCommerceSubscription;
use Illuminate\Http\JsonResponse;

class WooCommerceSubscriptionController extends Controller
{
    public function __invoke(StoreWooCommerceSubscriptionRequest $request): JsonResponse
    {
        ProcessWooCommerceSubscription::dispatchSync($request->validated());

        return response()->json([
            'status' => 'accepted',
        ]);
    }
}
