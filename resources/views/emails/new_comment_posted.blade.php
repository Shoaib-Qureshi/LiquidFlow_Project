<html>

<body>
    <h2>New Comment Posted</h2>
    <p>A new comment was posted.</p>
    <p><strong>Task ID:</strong> {{ $comment->task_id }}</p>
    <p><strong>Comment:</strong></p>
    <blockquote>{{ $comment->comment }}</blockquote>
    <p><strong>By user ID:</strong> {{ $comment->user_id }}</p>
    <p>You can view the task here: {{ url('/task/' . $comment->task_id) }}</p>
</body>

</html>