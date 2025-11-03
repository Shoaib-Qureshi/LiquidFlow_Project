<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskDependenciesRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Services\GmailApiService;
use App\Helpers\AdminNotifier;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->authorizeResource(Task::class, 'task');
    }

    /**
     * Get task dependencies.
     */
    public function getDependencies(Task $task)
    {
        $this->authorize('viewDependencies', $task);

        return response()->json([
            'blocked_by' => $task->blockedByTasks()->with('assignedUser')->get(),
            'blocking' => $task->blockingTasks()->with('assignedUser')->get(),
            'is_blocked' => $task->isBlocked(),
        ]);
    }

    /**
     * Update task dependencies.
     */
    public function updateDependencies(UpdateTaskDependenciesRequest $request, Task $task)
    {
        $dependencies = collect($request->dependencies);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
        $query = Task::query()->with(['assignedUser', 'project', 'brand', 'createdBy']);

        $brandFilterIds = null;
        if ($roles->contains('manager')) {
            $brandFilterIds = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->pluck('id');
            if ($brandFilterIds->isEmpty()) {
                $brandFilterIds = collect([-1]); // ensure no tasks returned
            }
            $query->whereIn('brand_id', $brandFilterIds);
        } elseif ($roles->contains('teamuser')) {
            // Team members only see tasks for brands they are assigned to
            $brandFilterIds = \App\Models\Brand::whereHas('teamUsers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->pluck('id');
            if ($brandFilterIds->isEmpty()) {
                $brandFilterIds = collect([-1]);
            }
            $query->whereIn('brand_id', $brandFilterIds);
        }

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", "desc");

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("status")) {
            $query->where("status", request("status"));
        }
        if (request("brand_id")) {
            $query->where("brand_id", request("brand_id"));
        }

        $tasks = $query->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->onEachSide(1);

        // Get brands for filter dropdown
        if ($roles->contains('manager') || $roles->contains('teamuser')) {
            $brands = \App\Models\Brand::whereIn('id', $brandFilterIds)->orderBy('name')->get(['id', 'name']);
        } else {
            $brands = \App\Models\Brand::orderBy('name')->get(['id', 'name']);
        }

        return inertia("Task/Index", [
            "tasks" => TaskResource::collection($tasks),
            "brands" => $brands,
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        // Only Admin and Manager can create tasks
        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
        if (!$roles->contains('admin') && !$roles->contains('manager')) {
            abort(403, 'You are not authorized to create tasks.');
        }

        // Get available brands for task creation, restricting managers to their brands
        $brandsQuery = \App\Models\Brand::orderBy('name', 'asc');
        if ($roles->contains('manager')) {
            $brandsQuery->whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }
        $brands = $brandsQuery->get();

        // Optional preselected brand (when navigating from a specific brand page)
        $preselectedBrandId = null;
        if (request()->filled('brand_id')) {
            $candidate = (int) request('brand_id');
            if ($brands->contains('id', $candidate)) {
                $preselectedBrandId = $candidate;
            }
        }

        // Convert brands to the format expected by the frontend
        $projects = $brands->map(function ($brand) {
            return [
                'id' => $brand->id,
                'name' => $brand->name,
                'description' => $brand->description ?? '',
                'type' => 'brand'
            ];
        });

        // Filter users based on current user's role
        if ($roles->contains('manager')) {
            $managedBrandIds = $brands->pluck('id');

            if ($managedBrandIds->isEmpty()) {
                $users = collect();
            } else {
                $users = User::whereHas('roles', function ($q) {
                    $q->where('name', 'TeamUser');
                })->whereHas('assignedBrands', function ($q) use ($managedBrandIds) {
                    $q->whereIn('brands.id', $managedBrandIds);
                })->orderBy('name', 'asc')->get();
            }
        } else {
            // Admins can assign tasks to any team member
            $users = User::whereHas('roles', function ($q) {
                $q->where('name', 'TeamUser');
            })->orderBy('name', 'asc')->get();
        }

        return inertia("Task/Create", [
            'projects' => $projects,
            'preselectedBrandId' => $preselectedBrandId,
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $user = Auth::user();

        // Only Admin and Manager can create tasks
        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
        if (!$roles->contains('admin') && !$roles->contains('manager')) {
            abort(403, 'You are not authorized to create tasks.');
        }

        $data = $request->validated();
        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();

        // Map project_id to brand_id for consistency.
        if (isset($data['project_id'])) {
            $data['brand_id'] = $data['project_id'];
            // Remove project_id to avoid inserting into non-existent column on newer schemas
            unset($data['project_id']);
        }

        if ($roles->contains('manager')) {
            $managerBrandIds = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->pluck('id');

            if ($managerBrandIds->isEmpty()) {
                throw ValidationException::withMessages([
                    'project_id' => 'No brands are assigned to you. Please contact an administrator.',
                ]);
            }

            if (!empty($data['brand_id']) && !$managerBrandIds->contains((int) $data['brand_id'])) {
                throw ValidationException::withMessages([
                    'project_id' => 'You are not authorized to create tasks for this brand.',
                ]);
            }

            $teamUserIds = User::whereHas('roles', function ($q) {
                $q->where('name', 'TeamUser');
            })->whereHas('assignedBrands', function ($q) use ($managerBrandIds) {
                $q->whereIn('brands.id', $managerBrandIds);
            })->pluck('id');

            if (!$teamUserIds->contains((int) $data['assigned_user_id'])) {
                throw ValidationException::withMessages([
                    'assigned_user_id' => 'You can only assign tasks to your team members.',
                ]);
            }
        }

        $task = Task::create($data);

        return redirect()->route('task.index')
            ->with('success', "Task \"$task->name\" was created successfully");
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $user = Auth::user();
        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));

        // Load the createdBy relationship and comments
        $task->load(['assignedUser', 'project', 'brand', 'createdBy', 'comments.user']);

        // Get available brands based on user role
        if ($roles->contains('manager')) {
            // Managers only see their managed brands
            $brands = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->orderBy('name', 'asc')->get();
        } else {
            // Admins see all brands
            $brands = \App\Models\Brand::orderBy('name', 'asc')->get();
        }

        // Get users for assignment based on role
        if ($roles->contains('manager')) {
            // Managers only see their team members
            $users = User::whereHas('roles', function ($q) {
                $q->where('name', 'TeamUser');
            })->whereHas('assignedBrands', function ($q) use ($user) {
                $q->whereIn('brands.id', function ($subquery) use ($user) {
                    $subquery->select('brands.id')
                        ->from('brands')
                        ->join('brand_managers', 'brands.id', '=', 'brand_managers.brand_id')
                        ->where('brand_managers.user_id', $user->id);
                });
            })->orderBy('name', 'asc')->get();
        } else {
            // Admins see all team members
            $users = User::whereHas('roles', function ($q) {
                $q->where('name', 'TeamUser');
            })->orderBy('name', 'asc')->get();
        }

        return inertia("Task/Show", [
            'task' => new TaskResource($task),
            'initialComments' => $task->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'comment' => $comment->comment,
                    'created_at' => $comment->created_at->format('M d, Y H:i'),
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                    ]
                ];
            }),
            'projects' => $brands->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'description' => $brand->description,
                ];
            }),
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        $user = Auth::user();
        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));

        // Load the createdBy relationship
        $task->load(['assignedUser', 'project', 'brand', 'createdBy']);

        $isTeamUser = $roles->contains('teamuser');
        $isManager = $roles->contains('manager');
        $isAdmin = $roles->contains('admin');

        // Get available brands based on user role
        if ($isManager) {
            // Managers only see their managed brands
            $brands = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->orderBy('name', 'asc')->get();
        } elseif ($isAdmin) {
            // Admins see all brands
            $brands = \App\Models\Brand::orderBy('name', 'asc')->get();
        } else {
            // Team users see only the task's brand (read-only)
            $brands = \App\Models\Brand::where('id', $task->brand_id)->get();
        }

        // Get users for assignment based on role
        if ($isManager) {
            // Managers only see their team members
            $users = User::whereHas('roles', function ($q) {
                $q->where('name', 'TeamUser');
            })->whereHas('assignedBrands', function ($q) use ($user) {
                $q->whereIn('brands.id', function ($subquery) use ($user) {
                    $subquery->select('brands.id')
                        ->from('brands')
                        ->join('brand_managers', 'brands.id', '=', 'brand_managers.brand_id')
                        ->where('brand_managers.user_id', $user->id);
                });
            })->orderBy('name', 'asc')->get();
        } elseif ($isAdmin) {
            // Admins see all team members
            $users = User::whereHas('roles', function ($q) {
                $q->where('name', 'TeamUser');
            })->orderBy('name', 'asc')->get();
        } else {
            // Team users don't see the user assignment dropdown
            $users = collect([]);
        }

        return inertia("Task/Edit", [
            'task' => new TaskResource($task),
            'projects' => $brands->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'description' => $brand->description,
                ];
            }),
            'users' => UserResource::collection($users),
            'isTeamUser' => $isTeamUser, // Pass this to frontend to control UI
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        // Authorize the action using the TaskPolicy. The policy will allow Admins,
        // Managers, and TeamUsers (for limited fields) as implemented in
        // App\Policies\TaskPolicy::update
        $this->authorize('update', $task);

        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['updated_by'] = Auth::id();

        // Map project_id to brand_id for consistency
        if (isset($data['project_id'])) {
            $data['brand_id'] = $data['project_id'];
            unset($data['project_id']);
        }

        if ($image) {
            if ($task->image_path) {
                Storage::disk('public')->deleteDirectory(dirname($task->image_path));
            }
            $data['image_path'] = $image->store('task/' . Str::random(), 'public');
        }
        $task->update($data);

        // Redirect to the task show page after the task is updated
        return redirect()->route('task.show', $task->id)
            ->with('success', "Task \"$task->name\" was updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $user = Auth::user();

        // Only Admin and Manager can delete tasks
        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
        if (!$roles->contains('admin') && !$roles->contains('manager')) {
            abort(403, 'You are not authorized to delete tasks.');
        }

        $name = $task->name;
        if ($task->image_path) {
            Storage::disk('public')->deleteDirectory(dirname($task->image_path));
        }
        $task->delete();

        return redirect()->route('task.index')
            ->with('success', "Task \"$name\" was deleted");
    }

    public function myTasks()
    {
        $user = auth()->user();
        $query = Task::query()->with(['assignedUser', 'project', 'brand', 'createdBy']);

        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));
        if ($roles->contains('teamuser')) {
            $brandIds = \App\Models\Brand::whereHas('teamUsers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->pluck('id');

            if ($brandIds->isEmpty()) {
                // only show tasks assigned to the user
                $query->where('assigned_user_id', $user->id);
            } else {
                $query->where(function ($q) use ($user, $brandIds) {
                    $q->where('assigned_user_id', $user->id)
                        ->orWhereIn('brand_id', $brandIds);
                });
            }
        } else {
            $query->where('assigned_user_id', $user->id);
        }

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", "desc");

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("status")) {
            $query->where("status", request("status"));
        }
        if (request("brand_id")) {
            $query->where("brand_id", request("brand_id"));
        }

        $tasks = $query->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->onEachSide(1);

        // Get brands for filter dropdown
        $brands = \App\Models\Brand::orderBy('name')->get(['id', 'name']);

        return inertia("Task/Index", [
            "tasks" => TaskResource::collection($tasks),
            "brands" => $brands,
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }
}
