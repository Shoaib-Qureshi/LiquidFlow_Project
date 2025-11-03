<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardMetricsService
{
    /**
     * Retrieve the brand ids a manager controls, or null for unrestricted users.
     */
    private function managedBrandIds(User $user): ?Collection
    {
        if (! $user->hasRole('Manager')) {
            return null;
        }

        $pivotBrandIds = $user->managedBrands()->pluck('brands.id');

        $clientManagedIds = Brand::query()
            ->whereHas('client', function ($query) use ($user) {
                $query->where('manager_user_id', $user->id);
            })
            ->pluck('id');

        return $pivotBrandIds
            ->merge($clientManagedIds)
            ->unique()
            ->values();
    }

    private function isTeamMember(User $user): bool
    {
        return !$user->hasRole('Admin') && !$user->hasRole('Manager');
    }

    private function getProjectStats(User $user, ?Collection $brandIds): array
    {
        if ($this->isTeamMember($user)) {
            $assignedBrandIds = Task::where('assigned_user_id', $user->id)
                ->whereNotNull('brand_id')
                ->distinct()
                ->pluck('brand_id');

            return [
                'total' => $assignedBrandIds->count(),
                'active' => $assignedBrandIds->isEmpty()
                    ? 0
                    : Brand::whereIn('id', $assignedBrandIds)->where('status', 'active')->count(),
                'completion_rate' => 0,
            ];
        }

        if ($brandIds !== null) {
            if ($brandIds->isEmpty()) {
                return [
                    'total' => 0,
                    'active' => 0,
                    'completion_rate' => 0,
                ];
            }

            $ids = $brandIds->all();
            return [
                'total' => count($ids),
                'active' => Brand::whereIn('id', $ids)->where('status', 'active')->count(),
                'completion_rate' => 0,
            ];
        }

        return [
            'total' => Brand::count(),
            'active' => Brand::where('status', 'active')->count(),
            'completion_rate' => 0,
        ];
    }

    private function getTaskStats(User $user, ?Collection $brandIds): array
    {
        $query = Task::query();

        if ($this->isTeamMember($user)) {
            $query->where('assigned_user_id', $user->id);
        } elseif ($brandIds !== null) {
            if ($brandIds->isEmpty()) {
                return [
                    'total' => 0,
                    'by_status' => [],
                    'completion_rate' => 0,
                ];
            }
            $query->whereIn('brand_id', $brandIds);
        }

        $tasksByStatus = $query->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($tasksByStatus);

        return [
            'total' => $total,
            'by_status' => $tasksByStatus,
            'completion_rate' => $total > 0 && isset($tasksByStatus['completed'])
                ? round(($tasksByStatus['completed'] / $total) * 100, 1)
                : 0,
        ];
    }

    private function getWorkloadDistribution(User $user, ?Collection $brandIds, int $limit = 10): Collection
    {
        if ($this->isTeamMember($user)) {
            return collect();
        }

        $brandKey = 'all';
        if ($brandIds !== null) {
            $brandKey = $brandIds->isEmpty() ? 'none' : implode(',', $brandIds->sort()->all());
        }
        $cacheKey = "workload_distribution_user_{$user->id}_{$brandKey}_limit_{$limit}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($brandIds, $limit) {
            if ($brandIds !== null && $brandIds->isEmpty()) {
                return collect();
            }

            $query = Task::query()
                ->select('assigned_user_id', DB::raw('COUNT(*) as active_tasks'))
                ->whereNotNull('assigned_user_id')
                ->where('status', '!=', 'completed');

            if ($brandIds !== null) {
                $query->whereIn('brand_id', $brandIds);
            }

            $rows = $query->groupBy('assigned_user_id')
                ->orderByDesc('active_tasks')
                ->limit($limit)
                ->get();

            $users = User::whereIn('id', $rows->pluck('assigned_user_id'))
                ->get(['id', 'name'])
                ->keyBy('id');

            return $rows->map(function ($row) use ($users) {
                $user = $users->get($row->assigned_user_id);

                return [
                    'user' => [
                        'id' => $user?->id,
                        'name' => $user?->name ?? 'Unknown',
                    ],
                    'active_tasks' => (int) $row->active_tasks,
                ];
            });
        });
    }

    private function getUpcomingDeadlines(User $user, ?Collection $brandIds): Collection
    {
        if ($brandIds !== null && $brandIds->isEmpty()) {
            return collect();
        }

        $query = Task::with(['brand', 'assignedUser'])
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date');

        if ($brandIds && $brandIds->isNotEmpty()) {
            $query->whereIn('brand_id', $brandIds);
        }

        if ($this->isTeamMember($user)) {
            $query->where('assigned_user_id', $user->id);
        }

        return $query->orderBy('due_date')
            ->limit(50)
            ->get()
            ->map(function ($task) {
                $dueDate = $task->due_date ? Carbon::parse($task->due_date) : null;
                $relativeText = null;
                $isOverdue = false;

                if ($dueDate) {
                    $diffMinutes = now()->diffInMinutes($dueDate, false);
                    if ($diffMinutes === 0) {
                        $relativeText = 'Due now';
                    } elseif ($diffMinutes > 0) {
                        $days = intdiv($diffMinutes, 1440);
                        $hours = intdiv($diffMinutes % 1440, 60);
                        $minutes = $diffMinutes % 60;
                        if ($days >= 1) {
                            $relativeText = $days === 1 ? '1 day left' : "{$days} days left";
                        } elseif ($hours >= 1) {
                            $relativeText = $hours === 1 ? '1 hour left' : "{$hours} hours left";
                        } else {
                            $relativeText = $minutes === 1 ? '1 minute left' : "{$minutes} minutes left";
                        }
                    } else {
                        $isOverdue = true;
                        $diffMinutes = abs($diffMinutes);
                        $days = intdiv($diffMinutes, 1440);
                        $hours = intdiv($diffMinutes % 1440, 60);
                        $minutes = $diffMinutes % 60;
                        if ($days >= 1) {
                            $relativeText = $days === 1 ? '1 day overdue' : "{$days} days overdue";
                        } elseif ($hours >= 1) {
                            $relativeText = $hours === 1 ? '1 hour overdue' : "{$hours} hours overdue";
                        } else {
                            $relativeText = $minutes === 1 ? '1 minute overdue' : "{$minutes} minutes overdue";
                        }
                    }
                }

                return [
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'due_date' => $dueDate ? $dueDate->format('M d, Y') : 'No due date',
                    'raw_due_date' => $dueDate ? $dueDate->toDateString() : null,
                    'is_overdue' => $isOverdue,
                    'days_remaining' => $relativeText ?? 'No due date',
                    'brand_id' => $task->brand?->id,
                    'brand_name' => $task->brand?->name ?? 'Unassigned brand',
                    'assigned_to' => $task->assignedUser ? [
                        'id' => $task->assignedUser->id,
                        'name' => $task->assignedUser->name,
                    ] : null,
                ];
            });
    }

    private function getRecentActivity(User $user, ?Collection $brandIds): Collection
    {
        if ($brandIds !== null && $brandIds->isEmpty()) {
            return collect();
        }

        $taskQuery = Task::with(['brand:id,name', 'updatedBy:id,name', 'createdBy:id,name'])
            ->orderByDesc('updated_at')
            ->limit(10);

        if ($brandIds && $brandIds->isNotEmpty()) {
            $taskQuery->whereIn('brand_id', $brandIds);
        }

        if ($this->isTeamMember($user)) {
            $taskQuery->where('assigned_user_id', $user->id);
        }

        $taskActivities = $taskQuery
            ->get()
            ->map(function ($task) {
                $isNew = $task->created_at && $task->created_at->equalTo($task->updated_at);
                $actor = $task->updatedBy?->name ?? $task->createdBy?->name ?? 'System';
                $description = $isNew
                    ? "Task \"{$task->name}\" created by {$actor}"
                    : "Task \"{$task->name}\" updated by {$actor}";

                if ($task->brand) {
                    $description .= " for {$task->brand->name}";
                }

                $timestamp = $task->updated_at ?? $task->created_at ?? now();

                return [
                    'description' => $description,
                    'timestamp' => $timestamp,
                ];
            })
            ->all();

        $brandActivities = [];

        if (!$this->isTeamMember($user)) {
            $brandActivities = DB::table('brands')
                ->leftJoin('users as creator', 'creator.id', '=', 'brands.created_by')
                ->select([
                    'brands.name',
                    'brands.created_at',
                    'brands.updated_at',
                    DB::raw('COALESCE(creator.name, "System") as creator_name'),
                ])
                ->when($brandIds && $brandIds->isNotEmpty(), function ($query) use ($brandIds) {
                    $query->whereIn('brands.id', $brandIds->all());
                })
                ->orderByDesc('brands.updated_at')
                ->limit(10)
                ->get()
                ->map(function ($brand) {
                    $updatedAt = $brand->updated_at ? Carbon::parse($brand->updated_at) : null;
                    $createdAt = $brand->created_at ? Carbon::parse($brand->created_at) : null;
                    $isNew = $createdAt && $updatedAt && $createdAt->equalTo($updatedAt);
                    $actor = $brand->creator_name ?? 'System';
                    $description = $isNew
                        ? "Brand \"{$brand->name}\" created by {$actor}"
                        : "Brand \"{$brand->name}\" updated";

                    $timestamp = $updatedAt ?? $createdAt ?? now();

                    return [
                        'description' => $description,
                        'timestamp' => $timestamp,
                    ];
                })
                ->all();
        }

        return collect(array_merge($taskActivities, $brandActivities))
            ->sortByDesc('timestamp')
            ->map(function ($activity) {
                $timestamp = $activity['timestamp'] instanceof Carbon
                    ? $activity['timestamp']
                    : Carbon::parse($activity['timestamp']);

                return [
                    'description' => $activity['description'],
                    'time' => $timestamp->diffForHumans(),
                ];
            })
            ->values();
    }

    private function getBlockedTasksStats(User $user, ?Collection $brandIds): array
    {
        $query = Task::select('tasks.id', 'tasks.name', 'tasks.brand_id', 'tasks.assigned_user_id')
            ->whereHas('blockedByTasks', function ($sub) {
                $sub->where('status', '!=', 'completed');
            })
            ->with(['blockedByTasks:id,name,status', 'brand:id,name', 'assignedUser:id,name'])
            ->orderByDesc('updated_at')
            ->limit(10);

        if ($brandIds && $brandIds->isNotEmpty()) {
            $query->whereIn('brand_id', $brandIds);
        }

        if ($this->isTeamMember($user)) {
            $query->where('assigned_user_id', $user->id);
        }

        $blockedTasks = $query->get();

        $tasks = $blockedTasks->map(function ($task) {
            return [
                'id' => $task->id,
                'name' => $task->name,
                'brand' => $task->brand ? [
                    'id' => $task->brand->id,
                    'name' => $task->brand->name,
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
            'count' => $blockedTasks->count(),
            'tasks' => $tasks,
        ];
    }

    private function getUserStats(User $user): array
    {
        $userTasks = Task::where('assigned_user_id', $user->id)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'pendingTasks' => $userTasks['pending'] ?? 0,
            'inProgressTasks' => $userTasks['in_progress'] ?? 0,
            'completedTasks' => $userTasks['completed'] ?? 0,
        ];
    }

    private function getActivityTimeline(User $user, ?Collection $brandIds): Collection
    {
        $query = Task::with(['brand', 'assignedUser'])
            ->where('updated_at', '>=', now()->subDays(7))
            ->orderBy('updated_at', 'desc')
            ->limit(10);

        if ($brandIds && $brandIds->isNotEmpty()) {
            $query->whereIn('brand_id', $brandIds);
        }

        if ($this->isTeamMember($user)) {
            $query->where('assigned_user_id', $user->id);
        }

        return $query->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'name' => $task->name,
                'status' => $task->status,
                'updated_at' => $task->updated_at,
                'brand' => $task->brand ? [
                    'id' => $task->brand->id,
                    'name' => $task->brand->name,
                ] : null,
                'assigned_to' => $task->assignedUser ? [
                    'id' => $task->assignedUser->id,
                    'name' => $task->assignedUser->name,
                ] : null,
            ];
        });
    }

    public function getAllMetrics()
    {
        $user = auth()->user();
        $brandIds = $this->managedBrandIds($user);
        $brandKey = $brandIds && $brandIds->isNotEmpty() ? implode(',', $brandIds->sort()->all()) : 'all';

        $cacheKey = "dashboard_metrics_user_{$user->id}_{$brandKey}_v6";

        return Cache::remember($cacheKey, now()->addMinute(), function () use ($user, $brandIds) {
            return [
                'projectStats' => $this->getProjectStats($user, $brandIds),
                'taskStats' => $this->getTaskStats($user, $brandIds),
                'workloadDistribution' => $this->getWorkloadDistribution($user, $brandIds),
                'upcomingDeadlines' => $this->getUpcomingDeadlines($user, $brandIds),
                'recentActivity' => $this->getRecentActivity($user, $brandIds),
                'blockedTasksStats' => $this->getBlockedTasksStats($user, $brandIds),
                'userStats' => $this->getUserStats($user),
                'activityTimeline' => $this->getActivityTimeline($user, $brandIds),
            ];
        });
    }
}

