<?php

namespace App\Http\Controllers;

use App\Services\DashboardMetricsService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $metricsService;

    public function __construct(DashboardMetricsService $metricsService)
    {
        $this->metricsService = $metricsService;
    }

    public function index()
    {
        $user = Auth::user();
        $metrics = $this->metricsService->getAllMetrics();


        return Inertia::render('Dashboard', [
            'metrics' => [
                'projectStats' => $metrics['projectStats'],
                'taskStats' => $metrics['taskStats'],
                'workloadDistribution' => $metrics['workloadDistribution'],
                'upcomingDeadlines' => $metrics['upcomingDeadlines'],
                'recentActivity' => $metrics['recentActivity'],
                'blockedTasksStats' => $metrics['blockedTasksStats'],
                'myTasks' => [
                    'pending' => $metrics['userStats']['pendingTasks'],
                    'inProgress' => $metrics['userStats']['inProgressTasks'],
                    'completed' => $metrics['userStats']['completedTasks'],
                ],
                'activityTimeline' => $metrics['activityTimeline']
            ]
        ]);
    }
}
