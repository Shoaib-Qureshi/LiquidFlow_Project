<h2>New Task Created</h2>
<p>A new task has been created under project: {{ $task->project->name ?? 'N/A' }}.</p>
<p><strong>Task:</strong> {{ $task->name }}</p>
<p><strong>Description:</strong> {{ $task->description }}</p>
<p><strong>Assigned to:</strong> {{ $task->assignedUser?->name ?? 'Unassigned' }} ({{ $task->assignedUser?->email ?? '' }})</p>
<p>View it in the app to take further action.</p>