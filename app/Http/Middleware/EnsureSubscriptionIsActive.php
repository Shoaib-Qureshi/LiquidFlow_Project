<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && method_exists($user, 'client')) {
            $user->loadMissing('client.subscription.plan');
            $subscription = optional($user->client)->subscription;

            $request->attributes->set('subscription', $subscription);
        }

        return $next($request);
    }
}
