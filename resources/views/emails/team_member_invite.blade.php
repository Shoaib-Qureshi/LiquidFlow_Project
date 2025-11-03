@php
    $appName = config('app.name', 'LiquidFlow');
@endphp

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You’re invited to {{ $appName }}</title>
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
                                        {{ $appName }}
                                    </td>
                                    <td align="right" style="font-size:12px; color:#6b7280;">{{ now()->format('M d, Y') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <div style="border-radius:24px; overflow:hidden; background:linear-gradient(145deg,#5c7cfa,#96a7ff); padding:0;">
                                <div style="padding:56px 40px; text-align:center;">
                                    <p style="margin:0; font-size:16px; color:#edf2ff;">Hi {{ $user->name }} 👋</p>
                                    <h1 style="margin:12px 0 0 0; font-size:26px; color:#ffffff; font-weight:700;">
                                        You’re officially on the team
                                    </h1>
                                    <p style="margin:18px 0 0 0; font-size:14px; color:#f8fbff; max-width:440px; line-height:1.6; display:inline-block;">
                                        You’ve been invited to collaborate in {{ $appName }}. Use the credentials below to sign in, review active projects, and stay synced with your team.
                                    </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4ff; border:1px solid #d6dcff; border-radius:18px; padding:24px 28px;">
                                <tr>
                                    <td style="width:50%; padding:6px 0;">
                                        <div style="font-size:13px; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;">
                                            Email
                                        </div>
                                        <div style="font-size:15px; color:#1f2937; font-weight:600; margin-top:4px;">
                                            {{ $user->email }}
                                        </div>
                                    </td>
                                    <td style="width:50%; padding:6px 0;" align="right">
                                        <div style="font-size:13px; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;">
                                            Temporary Password
                                        </div>
                                        <div style="font-size:15px; color:#1f2937; font-weight:600; margin-top:4px;">
                                            {{ $temporaryPassword }}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 32px 0 32px; text-align:center;">
                            <a href="{{ $loginUrl }}" style="display:inline-block; padding:14px 30px; font-size:14px; font-weight:600; color:#ffffff; background:linear-gradient(135deg,#5b8dec,#5270ff); border-radius:999px; text-decoration:none; box-shadow:0 10px 20px rgba(82, 112, 255, .2);">
                                SIGN IN TO {{ strtoupper($appName) }}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px 0 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="text-align:center; width:33.33%; padding:12px;">
                                        <div style="font-weight:600; color:#374151; font-size:14px;">Stay Synced</div>
                                        <div style="color:#6b7280; font-size:13px;">Follow every brand update in one place.</div>
                                    </td>
                                    <td style="text-align:center; width:33.33%; padding:12px;">
                                        <div style="font-weight:600; color:#374151; font-size:14px;">Collaborate Fast</div>
                                        <div style="color:#6b7280; font-size:13px;">Keep conversations tied to the right tasks.</div>
                                    </td>
                                    <td style="text-align:center; width:33.33%; padding:12px;">
                                        <div style="font-weight:600; color:#374151; font-size:14px;">Deliver More</div>
                                        <div style="color:#6b7280; font-size:13px;">Turn updates into action with fewer meetings.</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:12px 32px 4px 32px; color:#6b7280; font-size:12px; text-align:center; line-height:1.6;">
                            For security, please sign in and update your password right away.<br>
                            Need help? Reply directly to this email and we’ll assist you.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 28px 32px; text-align:center; color:#1f2937; font-size:13px;">
                            <div>We’re excited to build with you,</div>
                            <div style="font-weight:600; margin-top:4px;">The {{ $appName }} Team</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 36px 32px; text-align:center;">
                            <a href="{{ url('/') }}" style="color:#5b8dec; font-size:12px; text-decoration:none; font-weight:600;">VISIT THE DASHBOARD</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
