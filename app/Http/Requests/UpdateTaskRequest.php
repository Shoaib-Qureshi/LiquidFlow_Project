<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Use TaskPolicy to determine if the user can perform the update.
        // The controller calls $this->authorize('update', $task) so this returns
        // true here and the actual authorization is enforced in the controller.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Allow partial updates for team users (only status and description).
        $user = $this->user();
        $roles = ($user->roles ?? collect())->pluck('name')->map(fn($r) => strtolower($r));

        // Default full rules for admins and managers
        $fullRules = [
            "name" => ['required', 'max:255'],
            'image' => ['nullable', 'image'],
            "description" => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'project_id' => ['required', 'exists:brands,id'], // Changed to validate against brands table
            'assigned_user_id' => ['required', 'exists:users,id'],
            'status' => [
                'required',
                Rule::in(['Inactive', 'Active', 'completed'])
            ],
            'priority' => [
                'required',
                Rule::in(['low', 'medium', 'high'])
            ]
        ];

        if ($roles->contains('teamuser')) {
            // Team users can only send status and/or description
            return [
                'description' => ['nullable', 'string'],
                'status' => [
                    'required',
                    Rule::in(['Inactive', 'Active', 'completed'])
                ],
            ];
        }

        return $fullRules;
    }
}
