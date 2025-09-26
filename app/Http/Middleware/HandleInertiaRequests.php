<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Normalize roles and permissions for the frontend
        $roles = [];
        $permissions = [];
        $managedBrandId = null;

        if ($user) {
            try {
                $roles = $user->getRoleNames()->toArray();
            } catch (\Throwable $e) {
                $roles = [];
            }
            try {
                $permissions = $user->getPermissionNames()->toArray();
            } catch (\Throwable $e) {
                $permissions = [];
            }

            // Best-effort: if the relation exists, expose the first managed brand id (for manager single-brand rule)
            try {
                if (method_exists($user, 'managedBrands')) {
                    $managedBrandId = optional($user->managedBrands()->select('brands.id')->first())->id;
                }
            } catch (\Throwable $e) {
                $managedBrandId = null;
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'roles' => $roles,
                'permissions' => $permissions,
                'managed_brand_id' => $managedBrandId,
            ],
        ];
    }
}
