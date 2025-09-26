<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Brand;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardMetricsService
{
    /**
     * Get overall project statistics
     */
    public function getProjectStats($user = null)
    {
        // Role-aware brand totals
        $user = $user ?: auth()->user();

        if ($user && method_exists($user, 'hasRole') && $user->hasRole('Admin')) {
            $totalBrands = Brand::count();
            $activeBrands = Brand::where('status', 'active')->count();
        } elseif ($user && method_exists($user, 'hasRole') && $user->hasRole('Manager')) {
            $totalBrands = Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->count();
            $activeBrands = Brand::where('status', 'active')
                ->whereHas('managers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count();
        } else {
            // Team users: brands where they are assigned
            $totalBrands = Brand::whereHas('teamUsers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->count();
            $activeBrands = Brand::where('status', 'active')
                ->whereHas('teamUsers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count();
        }

        return [
            'total' => $totalBrands,
            'active' => $activeBrands,
            // kept for compatibility (not meaningful for brands)
            'completion_rate' => 0,
        ];
    }

    /**
     * Get task statistics by status
     */
    public function getTaskStats($user = null)
    {
        $user = $user ?: auth()->user();

        $query = Task::query();
        // Scope by role: Managers see only tasks for their brands
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('Manager')) {
            $query->whereHas('brand.managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user && method_exists($user, 'hasRole') && !$user->hasRole('Admin')) {
            // Team users: tasks for brands they are on OR tasks assigned to them
            $query->where(function ($q) use ($user) {
                $q->whereHas('brand.teamUsers', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                })
                ->orWhere('assigned_user_id', $user->id);
            });
        }

        $tasksByStatus = $query->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $totalTasks = array_sum($tasksByStatus);

        return [
            'total' => $totalTasks,
            'by_status' => $tasksByStatus,
            'completion_rate' => $totalTasks > 0 && isset($tasksByStatus['completed'])
                ? round(($tasksByStatus['completed'] / $totalTasks) * 100, 1)
                : 0,
        ];
    }

    /**
     * Get task distribution by user
     */
    public function getWorkloadDistribution($limit = 10)
    {
        // Real-time: remove caching and compute on each request
        return User::query()
            ->select(['users.id', 'users.name'])
            ->selectRaw('(SELECT COUNT(*) FROM tasks WHERE tasks.assigned_user_id = users.id AND tasks.status != ?) as active_tasks', ['completed'])
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('tasks')
                    ->whereColumn('tasks.assigned_user_id', 'users.id')
                    ->where('tasks.status', '!=', 'completed');
            })
            ->orderByDesc('active_tasks')
            ->limit($limit)
            ->get()
            ->map(function ($user) {
                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                    ],
                    'active_tasks' => (int) $user->active_tasks,
                ];
            });
    }

    /**
     * Get upcoming tasks and deadlines
     */
    public function getUpcomingDeadlines($user = null)
    {
        // Role-aware upcoming deadlines; no dummy data
        $user = $user ?: auth()->user();

        $query = Task::query()
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->where('due_date', '>=', now())
            ->with(['project']);

        if ($user && method_exists($user, 'hasRole') && $user->hasRole('Manager')) {
            $query->whereHas('brand.managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user && method_exists($user, 'hasRole') && !$user->hasRole('Admin')) {
            // Team users: deadlines for brands they are on or tasks assigned to them
            $query->where(function ($q) use ($user) {
                $q->whereHas('brand.teamUsers', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                })
                ->orWhere('assigned_user_id', $user->id);
            });
        }

        return $query->orderBy('due_date')
            ->limit(5)
            ->get()
            ->map(function ($task) {
                $days = Carbon::parse($task->due_date)->diffInDays(now(), false);
                return [
                    'task_name' => $task->name,
                    'brand_name' => optional($task->project)->name,
                    'due_date' => Carbon::parse($task->due_date)->toFormattedDateString(),
                    'days_remaining' => $days < 0 ? abs($days) . ' days overdue' : $days . ' days left',
                    'is_overdue' => $days < 0,
                ];
            })->values();
    }

    /**
     * Get recent activity metrics
     */
    public function getRecentActivity($user = null)
    {
        // Role-aware recent activity; no dummy data
        $user = $user ?: auth()->user();

        $query = Task::query();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('Manager')) {
            $query->whereHas('brand.managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user && method_exists($user, 'hasRole') && !$user->hasRole('Admin')) {
            $query->where(function ($q) use ($user) {
                $q->whereHas('brand.teamUsers', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                })
                ->orWhere('assigned_user_id', $user->id);
            });
        }

        return $query->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($task) {
                return [
                    'description' => "Task '{$task->name}' status: {$task->status}",
                    'time' => Carbon::parse($task->updated_at)->diffForHumans(),
                ];
            })->values();
    }

    /**
     * Get blocked tasks statistics
     */
    public function getBlockedTasksStats()
    {
        // Use eager loading with specific columns to reduce data transfer
        // Avoid selecting inside whereHas (which causes ambiguous column names in the subquery)
        $blockedTasks = Task::select('tasks.id', 'tasks.name', 'tasks.project_id', 'tasks.assigned_user_id')
            ->whereHas('blockedByTasks', function ($query) {
                $query->where('status', '!=', 'completed');
            })
            ->with([
                'blockedByTasks:id,name,status',
                'project:id,name',
                'assignedUser:id,name'
            ])
            ->orderByDesc('updated_at')
            ->limit(10) // Limit to most recent blocked tasks
            ->get();

        $count = $blockedTasks->count();

        // Use collection methods for efficient transformation
        $tasks = $blockedTasks->map(function ($task) {
            return [
                'id' => $task->id,
                'name' => $task->name,
                'project' => $task->project ? [
                    'id' => $task->project->id,
                    'name' => $task->project->name,
                ] : null,
                'assigned_to' => $task->assignedUser ? [
                    'id' => $task->assignedUser->id,
                    'name' => $task->assignedUser->name,
                ] : null,
                'blocked_by' => $task->blockedByTasks->map(function ($blockingTask) {
                    return [
                        'id' => $blockingTask->id,
                        'name' => $blockingTask->name,
                        'status' => $blockingTask->status,
                    ];
                })->values(),
            ];
        });

        return [
            'count' => $count,
            'tasks' => $tasks,
        ];
    }

    /**
     * Get all dashboard metrics
     */
    public function getAllMetrics()
    {
        // Real-time metrics (no caching)
        $user = auth()->user();
        return [
            'projectStats' => $this->getProjectStats($user),
            'taskStats' => $this->getTaskStats($user),
            'workloadDistribution' => $this->getWorkloadDistribution(),
            'upcomingDeadlines' => $this->getUpcomingDeadlines($user),
            'recentActivity' => $this->getRecentActivity($user),
            'blockedTasksStats' => $this->getBlockedTasksStats(),
            'userStats' => $this->getUserStats($user),
            'activityTimeline' => $this->getActivityTimeline(),
        ];
    }

    /**
     * Get stats for specific user
     */
    private function getUserStats($user)
    {
        $query = Task::query();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('Manager')) {
            // Managers: tasks for brands they manage
            $query->whereHas('brand.managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user && method_exists($user, 'hasRole') && !$user->hasRole('Admin')) {
            // Team users: tasks assigned to them OR in brands they are part of
            $query->where(function ($q) use ($user) {
                $q->where('assigned_user_id', $user->id)
                  ->orWhereHas('brand.teamUsers', function ($q2) use ($user) {
                      $q2->where('user_id', $user->id);
                  });
            });
        } else {
            // Admin defaults to assigned to them (often zero), but keep consistent behavior
            $query->where('assigned_user_id', $user->id);
        }

        $userTasks = $query->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        return [
            'pendingTasks' => $userTasks['pending'] ?? 0,
            'inProgressTasks' => $userTasks['in_progress'] ?? 0,
            'completedTasks' => $userTasks['completed'] ?? 0,
        ];
    }

    /**
     * Get activity timeline
     */
    private function getActivityTimeline()
    {
        return Task::with(['project', 'assignedUser'])
            ->where('updated_at', '>=', now()->subDays(7))
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'name' => $task->name,
                    'status' => $task->status,
                    'updated_at' => $task->updated_at,
                    'project' => $task->project ? [
                        'id' => $task->project->id,
                        'name' => $task->project->name,
                    ] : null,
                    'assigned_to' => $task->assignedUser ? [
                        'id' => $task->assignedUser->id,
                        'name' => $task->assignedUser->name,
                    ] : null,
                ];
            });
    }
}
