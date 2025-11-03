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
