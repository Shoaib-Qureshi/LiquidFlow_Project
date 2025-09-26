<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Task;
use App\Models\Comment;
use App\Mail\NewBrandCreated;
use App\Helpers\AdminNotifier;
use App\Services\GmailApiService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;


class ProjectController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $email = $user?->email ?? '';

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", "desc");

        // If tier2.digital user, show paginated list of projects as before
        if (str_ends_with($email, 'tier2.digital')) {
            $query = Project::query();
            if (request("name")) {
                $query->where("name", "like", "%" . request("name") . "%");
            }
            if (request("status")) {
                $query->where("status", request("status"));
            }

            $projects = $query->orderBy($sortField, $sortDirection)
                ->paginate(10)
                ->onEachSide(1);

            return inertia("Project/Index", [
                "projects" => ProjectResource::collection($projects),
                'tasks' => null,
                'queryParams' => request()->query() ?: null,
                'success' => session('success'),
            ]);
        }

        // For other users, show only the first project (if any) and its tasks
        $project = Project::orderBy($sortField, $sortDirection)->first();

        if (!$project) {
            return inertia("Project/Index", [
                "projects" => ['data' => []],
                'tasks' => null,
                'queryParams' => request()->query() ?: null,
                'success' => session('success'),
            ]);
        }

        $tasks = $project->tasks()->orderBy($sortField, $sortDirection)->paginate(10)->onEachSide(1);
        $openTasksCount = $project->tasks()->where('status', '<>', 'completed')->count();

        // Create a LengthAwarePaginator so the frontend receives the same paginator shape
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            collect([$project]), // items
            1, // total
            10, // per page
            1, // current page
            [
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );

        return inertia("Project/Index", [
            "projects" => ProjectResource::collection($paginator),
            'tasks' => TaskResource::collection($tasks),
            'openTasksCount' => $openTasksCount,
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
        $managers = [];
        if ($user && method_exists(\App\Models\User::class, 'role')) {
            try {
                $managers = \App\Models\User::role('Manager')->get(['id', 'name', 'email']);
            } catch (\Throwable $e) {
                $managers = [];
            }
        } else {
            try {
                $managers = \App\Models\User::whereHas('roles', function($q){ $q->where('name', 'Manager'); })->get(['id','name','email']);
            } catch (\Throwable $e) {
                $managers = [];
            }
        }

        return inertia("Project/Create", [
            'managers' => $managers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();
        /*  @var $image \Illuminate\Http\UploadedFile */
        $image = $data['image'] ?? null;
        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();
        if ($image) {
            // store brand images under brand/ to reflect the new URI
            $data['image_path'] = $image->store('brand/' . Str::random(), 'public');
        }


        // File upload handling
        $file = $request->file('file');  // Get the file from the request
        if ($file) {
            $data['file_path'] = $file->store('brand_files/' . Str::random(), 'public');  // Store file in a folder
        }


        //Create Project
        $project = Project::create($data);

        // Send notification email to admin
        try {
            $admins = AdminNotifier::adminEmails();
            $mailer = new GmailApiService();
            foreach ($admins as $admin) {
                $mailable = new NewBrandCreated($project);
                // Render mailable to HTML and subject
                $html = $mailable->render();
                $subject = method_exists($mailable, 'subject') ? ($mailable->subject ?? $mailable->build()->subject ?? '') : '';
                // Fallback: try to get subject from build
                if (empty($subject)) {
                    try {
                        $subject = $mailable->build()->subject ?? '';
                    } catch (\Exception $ex) {
                        $subject = 'New Brand Created';
                    }
                }
                $mailer->sendRawMessage($admin, $subject, $html);
            }
        } catch (\Exception $e) {
            logger()->error('Failed to send new brand email: ' . $e->getMessage());
        }

        //   Redirect to Show page 
        return redirect()->route('project.show', $project->id)
            ->with('success', 'You have successfully created your brand');


        // this code will go to index.jsx
        // return to_route('project.index') 
        //  ->with('success', 'Project was created');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $query = $project->tasks();

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", "desc");

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }
        if (request("status")) {
            $query->where("status", request("status"));
        }

        $tasks = $query->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->onEachSide(1);
        return inertia('Project/Show', [
            'project' => new ProjectResource($project),
            "tasks" => TaskResource::collection($tasks),
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        return inertia('Project/Edit', [
            'project' => new ProjectResource($project),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['updated_by'] = Auth::id();
        if ($image) {
            if ($project->image_path) {
                Storage::disk('public')->deleteDirectory(dirname($project->image_path));
            }
            $data['image_path'] = $image->store('brand/', 'public');
        }


        // File update handling
        $file = $request->file('file');  // Get the file from the request
        if ($file) {
            if ($project->file_path) {
                Storage::disk('public')->delete($project->file_path);  // Delete old file
            }
            $data['file_path'] = $file->store('brand_files/' . Str::random(), 'public');  // Store new file
        }



        $project->update($data);

        return redirect()->route('project.show', $project->id)
            ->with('success', "Brand \"$project->name\" was updated");

        // return to_route('project.index')
        //     ->with('success', "Project \"$project->name\" was updated");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {

        if ($project->tasks()->exists()) {
            return back()->with([
                'success' => "Cannot delete Brand \"{$project->name}\". Please delete all associated tasks first.",
            ]);
        }
        $name = $project->name;
        $project->delete();
        if ($project->image_path) {
            Storage::disk('public')->deleteDirectory(dirname($project->image_path));
        }
        return to_route('project.index')
            ->with('success', "Project \"$name\" was deleted");
    }
}
