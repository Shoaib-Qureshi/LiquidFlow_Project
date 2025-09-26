<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Brand;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share authenticated user's roles and permissions with Inertia so front-end can
        // conditionally render UI elements.
        Inertia::share([
            'auth' => function () {
                $user = Auth::user();

                if (!$user) {
                    return null;
                }

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                    'managed_brand_id' => $user->hasRole('Manager') ? optional($user->managedBrands()->first())->id : null,
                    'managed_brand_count' => $user->hasRole('Manager') ? (int) $user->managedBrands()->count() : null,
                    // Accessible brands (union of managed and team brands). Used for navbar routing when exactly one brand is available.
                    'accessible_brand_count' => (function() use ($user) {
                        try {
                            $ids = \App\Models\Brand::where(function($q) use ($user) {
                                $q->whereHas('managers', function($q2) use ($user){ $q2->where('user_id', $user->id); })
                                  ->orWhereHas('teamUsers', function($q3) use ($user){ $q3->where('user_id', $user->id); });
                            })->pluck('id')->unique();
                            return $ids->count();
                        } catch (\Exception $e) {
                            return 0;
                        }
                    })(),
                    'accessible_single_brand_id' => (function() use ($user) {
                        try {
                            $ids = \App\Models\Brand::where(function($q) use ($user) {
                                $q->whereHas('managers', function($q2) use ($user){ $q2->where('user_id', $user->id); })
                                  ->orWhereHas('teamUsers', function($q3) use ($user){ $q3->where('user_id', $user->id); });
                            })->pluck('id')->unique();
                            return $ids->count() === 1 ? $ids->first() : null;
                        } catch (\Exception $e) {
                            return null;
                        }
                    })(),
                ];
            },
            // Provide a small list of manager users so the front-end can present a selector
            'managers' => function () {
                try {
                    return User::role('Manager')->get(['id', 'name'])->toArray();
                } catch (\Exception $e) {
                    return [];
                }
            }
            ,
            // Share brands (for dropdowns) to make client-side dropdowns resilient
            'brands' => function () {
                $user = Auth::user();
                if (! $user) {
                    return [];
                }

                // Only share brands for Admins and Managers (others get empty)
                if (! $user->hasRole('Admin') && ! $user->hasRole('Manager')) {
                    return [];
                }

                try {
                    return Brand::orderBy('name')->get(['id','name'])->toArray();
                } catch (\Exception $e) {
                    return [];
                }
            }
        ]);
    }
}
