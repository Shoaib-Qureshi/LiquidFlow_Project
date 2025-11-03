<?php

namespace App\Policies;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BrandPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Manager', 'TeamUser']) || 
               $user->hasAnyPermission(['view_all_brands', 'view_assigned_brands']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Brand $brand): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        if ($user->hasRole('Manager')) {
            return $brand->managers()->where('user_id', $user->id)->exists();
        }

        return $brand->teamUsers()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        if ($user->hasRole('Manager')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Brand $brand): bool
    {
        $roleNames = $user->getRoleNames()->map(fn ($role) => strtolower($role));

        if ($roleNames->contains('admin')) {
            return true;
        }

        if ($user->hasAnyPermission(['manage brands', 'update brand', 'edit brand'])) {
            return true;
        }

        if ($roleNames->contains('manager')) {
            return $brand->managers()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Brand $brand): bool
    {
        return $user->hasRole('Admin');
    }

    /**
     * Determine whether the user can assign managers to the brand.
     */
    public function assignManager(User $user, Brand $brand): bool
    {
        return $user->hasRole('Admin');
    }

    /**
     * Determine whether the user can assign team members to the brand.
     */
    public function assignTeamMember(User $user, Brand $brand): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        return $user->hasRole('Manager') && $brand->managers()->where('user_id', $user->id)->exists();
    }
}
