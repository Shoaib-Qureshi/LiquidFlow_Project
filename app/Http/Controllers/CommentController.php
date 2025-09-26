<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Task;
use App\Mail\NewCommentPosted;
use App\Helpers\AdminNotifier;
use App\Services\GmailApiService;

class CommentController extends Controller
{
    public function store(Request $request)
    {

        $validatedData = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'comment' => 'required|string|max:1000',
        ]);

        $comment = new Comment();
        $comment->task_id = $validatedData['task_id'];
        $comment->comment = $validatedData['comment'];
        $comment->user_id = auth()->id(); // Assuming you are using authentication
        $comment->save();

        // Send notification to admin(s)
        try {
            $admins = AdminNotifier::adminEmails();
            $mailer = new GmailApiService();
            foreach ($admins as $admin) {
                $mailable = new NewCommentPosted($comment);
                $html = $mailable->render();
                $subject = method_exists($mailable, 'subject') ? ($mailable->subject ?? '') : '';
                if (empty($subject)) {
                    try {
                        $subject = $mailable->build()->subject ?? '';
                    } catch (\Exception $ex) {
                        $subject = 'New Comment Posted';
                    }
                }
                $mailer->sendRawMessage($admin, $subject, $html);
            }
        } catch (\Exception $e) {
            logger()->error('Failed to send new comment email: ' . $e->getMessage());
        }

        // Load the user who posted the comment (to display it)
        $comment->load('user');

        return response()->json([
            'success' => true,
            'comment' => $comment,
        ]);
    }
    public function show($taskId)
    {
        $task = Task::with('comments.user')->findOrFail($taskId); // Eager load comments with user
        return view('tasks.show', compact('task'));
    }
}
