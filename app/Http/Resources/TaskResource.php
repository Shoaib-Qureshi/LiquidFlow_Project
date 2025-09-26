<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TaskResource extends JsonResource
{

    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'created_at' => $this->created_at ? (new Carbon($this->created_at))->format('Y-m-d') : null,
            'due_date' => $this->due_date ? (new Carbon($this->due_date))->format('Y-m-d') : null,
            'status' => $this->status,
            'priority' => $this->priority,
            'image_path' => $this->image_path && !(str_starts_with($this->image_path, 'http')) ?
                Storage::url($this->image_path) : '',
            'project_id' => $this->project_id,
            'brand_id' => $this->brand_id,
            // Keep the `project` key for backwards-compatibility. If a Project model
            // doesn't exist (we repurposed project_id to reference brands), fall
            // back to returning the brand as a project-shaped array so the
            // frontend can still link to route('project.show', id).
            'project' => $this->project ? new ProjectResource($this->project) : (
                $this->brand ? [
                    'id' => $this->brand->id,
                    'name' => $this->brand->name,
                    'description' => $this->brand->description ?? '',
                ] : null
            ),
            'brand' => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'description' => $this->brand->description,
            ] : null,
            'assigned_user_id' => $this->assigned_user_id,
            'assignedUser' => $this->assignedUser ? new UserResource($this->assignedUser) : null,
            'createdBy' => $this->createdBy ? new UserResource($this->createdBy) : null,
            'updatedBy' => $this->updatedBy ? new UserResource($this->updatedBy) : null,
        ];
    }
}
