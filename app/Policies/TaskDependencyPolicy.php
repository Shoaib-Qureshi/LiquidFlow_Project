<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskDependencyPolicy
{
    /**
     * Determine whether the user can manage dependencies for the task.
     */
    public function manageDependencies(User $user, Task $task): bool
    {
        // Allow if user has explicit permission
        if ($user->hasPermissionTo('edit tasks')) {
            return true;
        }

        // Allow if user is assigned to the task
        if ($task->assigned_user_id === $user->id) {
            return true;
        }

        // Allow if user created the task
        if ($task->created_by === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view dependencies for the task.
     */
    public function viewDependencies(User $user, Task $task): bool
    {
        // Allow if user has permission to view tasks
        if ($user->hasPermissionTo('view tasks')) {
            return true;
        }

        // Allow if user is assigned to the task
        if ($task->assigned_user_id === $user->id) {
            return true;
        }

        // Allow if user created the task
        if ($task->created_by === $user->id) {
            return true;
        }

        return false;
    }
}
