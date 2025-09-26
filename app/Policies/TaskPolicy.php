<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view any tasks.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view tasks
    }

    /**
     * Determine whether the user can view the task.
     */
    public function view(User $user, Task $task): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        if ($user->hasRole('Manager')) {
            // Manager can view tasks from their assigned brands
            if ($task->brand && $task->brand->managers()->where('user_id', $user->id)->exists()) {
                return true;
            }
            // For now, also allow managers to view all tasks (can be restricted later)
            return true;
        }

        return $task->assigned_user_id === $user->id;
    }

    /**
     * Determine whether the user can create tasks.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Manager');
    }

    /**
     * Determine whether the user can update the task.
     */
    public function update(User $user, Task $task): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        if ($user->hasRole('Manager')) {
            // For now, allow managers to edit all tasks
            // TODO: Implement proper brand-manager relationship check
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the task.
     */
    public function delete(User $user, Task $task): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        if ($user->hasRole('Manager')) {
            // For now, allow managers to delete all tasks
            // TODO: Implement proper brand-manager relationship check
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can assign the task.
     */
    public function assign(User $user, Task $task): bool
    {
        if ($user->hasRole('Admin')) {
            return true;
        }

        if ($user->hasRole('Manager')) {
            // For now, allow managers to assign all tasks
            // TODO: Implement proper brand-manager relationship check
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update task status.
     */
    public function updateStatus(User $user, Task $task): bool
    {
        return $task->assigned_user_id === $user->id;
    }

    /**
     * Determine whether the user can view task dependencies.
     */
    public function viewDependencies(User $user, Task $task): bool
    {
        return $this->view($user, $task);
    }
}
