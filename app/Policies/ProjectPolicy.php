<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any projects.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated roles can access the Brands area (Projects used as Brands UI)
        return $user->hasAnyRole(['Admin', 'Manager', 'TeamUser']);
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        // All authenticated roles can view brand details; fine-grained access handled in controllers
        return $user->hasAnyRole(['Admin', 'Manager', 'TeamUser']);
    }

    /**
     * Determine whether the user can create projects.
     */
    public function create(User $user): bool
    {
        // Admins and Managers can create a brand (Managers limited to one enforced in controller/business logic)
        return $user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasPermissionTo('create_brand');
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        // Admins can edit; Managers can edit their own brand (controller may enforce ownership)
        return $user->hasRole('Admin') || $user->hasPermissionTo('edit_brand') || $user->hasRole('Manager');
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        // Only Admins (and users with explicit permission) can delete brands
        return $user->hasRole('Admin') || $user->hasPermissionTo('delete_brand');
    }
}
