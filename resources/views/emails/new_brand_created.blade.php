<html>

<body>
    <h2>New Brand Created</h2>
    <p>A new brand was created on the site.</p>
    <p><strong>Name:</strong> {{ $project->name }}</p>
    <p><strong>Description:</strong> {{ $project->description }}</p>
    <p><strong>Created by (ID):</strong> {{ $project->created_by }}</p>
    <p>You can view it here: {{ url('/brand/' . $project->id) }}</p>
</body>

</html>