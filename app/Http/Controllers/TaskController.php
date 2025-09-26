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
        $user = Auth::user();
        $query = Task::query()->with(['assignedUser', 'project', 'brand', 'createdBy']);

        // Filter tasks based on user role
        if ($user->hasRole('Admin')) {
            // Admin can see all tasks
        } elseif ($user->hasRole('Manager')) {
            // Manager can only see tasks associated with their brands
            $query->whereHas('brand.managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
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

        // Get brands for filter dropdown (role-aware)
        if ($user->hasRole('Admin')) {
            $brands = \App\Models\Brand::orderBy('name')->get(['id', 'name']);
        } else {
            $brands = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->orderBy('name')->get(['id', 'name']);
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
        if (!$user->hasRole('Admin') && !$user->hasRole('Manager')) {
            abort(403, 'You are not authorized to create tasks.');
        }

        // Get available brands for task creation (role-aware)
        if ($user->hasRole('Admin')) {
            $brands = \App\Models\Brand::orderBy('name', 'asc')->get();
        } else {
            $brands = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->orderBy('name', 'asc')->get();
        }

        // Convert brands to the format expected by the frontend
        $projects = $brands->map(function($brand) {
            return [
                'id' => $brand->id,
                'name' => $brand->name,
                'description' => $brand->description ?? '',
                'type' => 'brand'
            ];
        });

        // Optional preselected brand (when navigating from a specific brand page)
        $preselectedBrandId = null;
        if (request()->filled('brand_id')) {
            $candidate = (int) request('brand_id');
            if (\App\Models\Brand::whereKey($candidate)->exists()) {
                $preselectedBrandId = $candidate;
            }
        }

        // Filter users based on current user's role
        if ($user->hasRole('Manager')) {
            // Managers can only assign tasks to other Managers and themselves, not to Admins
            $users = User::role(['Manager'])->orderBy('name', 'asc')->get();
        } else {
            // Admins can assign tasks to both Managers and Admins
            $users = User::role(['Manager', 'Admin'])->orderBy('name', 'asc')->get();
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
        if (!$user->hasRole('Admin') && !$user->hasRole('Manager')) {
            abort(403, 'You are not authorized to create tasks.');
        }

        $data = $request->validated();
        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();

        // Handle empty assigned_user_id
        if (empty($data['assigned_user_id'])) {
            $data['assigned_user_id'] = null;
        }

        // Map project_id to brand_id for consistency.
        // Keep project_id present so existing non-null DB column is satisfied.
        if (isset($data['project_id'])) {
            $data['brand_id'] = $data['project_id'];
            // NOTE: we intentionally DO NOT unset project_id here; some installs still
            // have a non-null project_id column, so leaving it populated avoids
            // NOT NULL constraint failures. If you later migrate project_id to be
            // nullable or repoint it to brands, you can remove this.
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

        // Load the createdBy relationship and comments
        $task->load(['assignedUser', 'project', 'brand', 'createdBy', 'comments.user']);

        // Admin sees all brands; Manager sees only associated brands
        if ($user->hasRole('Admin')) {
            $brands = \App\Models\Brand::orderBy('name', 'asc')->get();
        } else {
            $brands = \App\Models\Brand::whereHas('managers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->orderBy('name', 'asc')->get();
        }

        // Show managers and admins for assignment
        $users = User::role(['Manager', 'Admin'])->orderBy('name', 'asc')->get();

        return inertia("Task/Show", [
            'task' => new TaskResource($task),
            'initialComments' => $task->comments->map(function($comment) {
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
            'projects' => $brands->map(function($brand) {
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

        // Load the createdBy relationship
        $task->load(['assignedUser', 'project', 'brand', 'createdBy']);

        // For now, let both Admin and Manager see all brands
        $brands = \App\Models\Brand::orderBy('name', 'asc')->get();

        // Show managers and admins for assignment
        $users = User::role(['Manager', 'Admin'])->orderBy('name', 'asc')->get();

        return inertia("Task/Edit", [
            'task' => new TaskResource($task),
            'projects' => $brands->map(function($brand) {
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
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $user = Auth::user();

        // Only Admin and Manager can update tasks
        if (!$user->hasRole('Admin') && !$user->hasRole('Manager')) {
            abort(403, 'You are not authorized to update tasks.');
        }

        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['updated_by'] = Auth::id();
        
        // Map project_id to brand_id for consistency
        if (isset($data['project_id'])) {
            $data['brand_id'] = $data['project_id'];
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
        if (!$user->hasRole('Admin') && !$user->hasRole('Manager')) {
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
        $query = Task::query()->where('assigned_user_id', $user->id)->with(['assignedUser', 'project', 'brand', 'createdBy']);

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