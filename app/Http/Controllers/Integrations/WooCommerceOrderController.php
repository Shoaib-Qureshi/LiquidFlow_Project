<?php

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Http\Requests\Integrations\StoreWooCommerceOrderRequest;
use App\Jobs\Integrations\ProcessWooCommerceOrder;
use Illuminate\Http\JsonResponse;

class WooCommerceOrderController extends Controller
{
    public function __invoke(StoreWooCommerceOrderRequest $request): JsonResponse
    {
        $payload = $request->validated();

        ProcessWooCommerceOrder::dispatchSync($payload);

        return response()->json([
            'status' => 'accepted',
        ]);
    }
}
