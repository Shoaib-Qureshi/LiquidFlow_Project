@php
    $taskTitle = optional($comment->task)->title ?? 'Task #' . $comment->task_id;
    $taskUrl = url('/task/' . $comment->task_id);
    $commentAuthor = optional($comment->user)->name ?? 'A team member';
    $commentCreatedAt = optional($comment->created_at)
        ? $comment->created_at->timezone(config('app.timezone'))->format('M d, Y h:i A')
        : now()->format('M d, Y h:i A');
@endphp

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Comment Posted</title>
</head>

<body style="margin:0; padding:0; background-color:#f5f7fb; font-family:'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fb; padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:95%; background:#ffffff; border-radius:28px; overflow:hidden; box-shadow:0 20px 45px rgba(42, 67, 113, 0.12);">
                    <tr>
                        <td style="padding:28px 32px 0 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-weight:700; font-size:17px; color:#111827;">
                                        LiquidFlow
                                    </td>
                                    <td align="right" style="font-size:12px; color:#6b7280;">{{ $commentCreatedAt }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <div style="border-radius:24px; overflow:hidden; background:linear-gradient(145deg,#5c7cfa,#96a7ff); padding:0;">
                                <div style="padding:56px 40px; text-align:center;">
                                    <p style="margin:0; font-size:16px; color:#edf2ff;">Hi there 👋</p>
                                    <h1 style="margin:12px 0 0 0; font-size:26px; color:#ffffff; font-weight:700;">
                                        A New Comment Needs Your Attention
                                    </h1>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 32px 32px;">
                            <div style="text-align:center;">
                                <h2 style="font-size:20px; color:#1f2937; margin:0 0 8px;">{{ $taskTitle }}</h2>
                                <p style="color:#6b7280; font-size:14px; margin:0 0 24px;">
                                    {{ $commentAuthor }} added a new update to this task. Review the details below and jump in to keep things moving.
                                </p>
                                <blockquote style="margin:0 auto 28px; padding:20px 24px; background:#f3f4ff; border:1px solid #d6dcff; border-radius:18px; color:#374151; font-size:15px; line-height:1.6; max-width:420px;">
                                    “{{ $comment->comment }}”
                                </blockquote>
                                <a href="{{ $taskUrl }}" style="display:inline-block; padding:14px 30px; font-size:14px; font-weight:600; color:#ffffff; background:linear-gradient(135deg,#5b8dec,#5270ff); border-radius:999px; text-decoration:none; box-shadow:0 10px 20px rgba(82, 112, 255, .2);">
                                    VIEW TASK &amp; REPLY
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 36px 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                                <tr>
                                    <td style="width:33.33%; text-align:center; padding:12px;">
                                        <div style="font-weight:600; color:#374151; font-size:14px;">Comment By</div>
                                        <div style="color:#6b7280; font-size:13px;">{{ $commentAuthor }}</div>
                                    </td>
                                    <td style="width:33.33%; text-align:center; padding:12px;">
                                        <div style="font-weight:600; color:#374151; font-size:14px;">Task ID</div>
                                        <div style="color:#6b7280; font-size:13px;">#{{ $comment->task_id }}</div>
                                    </td>
                                    <td style="width:33.33%; text-align:center; padding:12px;">
                                        <div style="font-weight:600; color:#374151; font-size:14px;">Posted On</div>
                                        <div style="color:#6b7280; font-size:13px;">{{ $commentCreatedAt }}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 28px 32px; color:#6b7280; font-size:12px; text-align:center; line-height:1.6;">
                            You’re receiving this message because you’re listed as an admin in {{ config('app.name') }}. <br>
                            Thanks for keeping projects on track!
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 36px 32px; text-align:center;">
                            <a href="{{ url('/') }}" style="color:#5b8dec; font-size:12px; text-decoration:none; font-weight:600;">VISIT LIQUIDFLOW DASHBOARD</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
