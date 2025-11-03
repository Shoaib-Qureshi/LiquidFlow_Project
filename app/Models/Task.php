<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'image_path',
        'status',
        'priority',
        'due_date',
        'assigned_user_id',
        'created_by',
        'updated_by',
        'brand_id',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the brand that owns the task
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Get the tasks that are blocking this task.
     */
    public function blockedByTasks()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'blocked_by_task_id')
            ->withTimestamps();
    }

    /**
     * Get the tasks that this task is blocking.
     */
    public function blockingTasks()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'blocked_by_task_id', 'task_id')
            ->withTimestamps();
    }

    /**
     * Check if this task is blocked by any unfinished tasks.
     */
    public function isBlocked(): bool
    {
        return $this->blockedByTasks()
            ->where('status', '!=', 'completed')
            ->exists();
    }

    /**
     * Get all tasks that need to be completed before this task.
     */
    public function getDependencyChain()
    {
        $chain = collect();
        $this->buildDependencyChain($chain);
        return $chain->unique();
    }

    /**
     * Recursively build the dependency chain.
     */
    protected function buildDependencyChain(&$chain)
    {
        $blockedBy = $this->blockedByTasks;
        foreach ($blockedBy as $task) {
            $chain->push($task);
            $task->buildDependencyChain($chain);
        }
    }

    /**
     * Check if adding a dependency would create a circular reference.
     */
    public function wouldCreateCircularDependency(Task $task): bool
    {
        // Check if the task we want to add as a blocker is already blocked by this task
        return $task->getDependencyChain()->contains($this);
    }
}
