<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBrandAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $brand = $request->route('brand');

        if (!$user) {
            abort(403, 'Unauthorized.');
        }

        if (!$brand) {
            return $next($request);
        }

        // Roles are stored with capitalized names in the app: Admin, Manager, TeamUser
        if ($user->hasRole('Admin')) {
            return $next($request);
        }
        if ($user->hasRole('Manager') && $brand->managers()->where('user_id', $user->id)->exists()) {
            return $next($request);
        }
        if ($user->hasRole('TeamUser') && $brand->teamUsers()->where('user_id', $user->id)->exists()) {
            return $next($request);
        }

        abort(403, 'Unauthorized action.');
    }
}
