<?php

namespace App\Providers;

use App\Models\Project;
use App\Models\Brand;
use App\Models\Task;
use App\Policies\ProjectPolicy;
use App\Policies\BrandPolicy;
use App\Policies\TaskPolicy;
use App\Policies\TaskDependencyPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Project::class => ProjectPolicy::class,
        Brand::class => BrandPolicy::class,
        Task::class => TaskPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
