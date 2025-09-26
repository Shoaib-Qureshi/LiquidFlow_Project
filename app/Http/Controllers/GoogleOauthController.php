<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Artisan;

class GoogleOauthController extends Controller
{
    public function redirect()
    {
        $clientId = config('services.google.client_id') ?? env('GOOGLE_CLIENT_ID');
        $redirectUri = route('google.callback');
        $scope = urlencode('https://www.googleapis.com/auth/gmail.send');

        // If client id missing at runtime, try reading .env directly as a fallback
        if (empty($clientId)) {
            $envPath = base_path('.env');
            if (is_readable($envPath)) {
                $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    if (strpos(trim($line), 'GOOGLE_CLIENT_ID=') === 0) {
                        $parts = explode('=', $line, 2);
                        $val = trim($parts[1] ?? '');
                        // remove optional surrounding quotes
                        $val = trim($val, " \t\n\r\0\x0B\"'");
                        if (!empty($val)) {
                            $clientId = $val;
                            break;
                        }
                    }
                }
            }

            // still missing -> return helpful message
            if (empty($clientId)) {
                return response()->json([
                    'message' => 'Missing GOOGLE_CLIENT_ID at runtime and .env fallback did not find a value. Please ensure GOOGLE_CLIENT_ID is set in .env and restart the server.'
                ], 500);
            }
        }

        $url = "https://accounts.google.com/o/oauth2/v2/auth"
            . "?response_type=code"
            . "&access_type=offline"
            . "&prompt=consent"
            . "&client_id={$clientId}"
            . "&redirect_uri=" . urlencode($redirectUri)
            . "&scope={$scope}";

        return redirect($url);
    }

    public function callback(Request $request)
    {
        $code = $request->query('code');
        if (! $code) {
            return response('No code returned from Google', 400);
        }

        $clientId = config('services.google.client_id') ?? env('GOOGLE_CLIENT_ID');
        $clientSecret = config('services.google.client_secret') ?? env('GOOGLE_CLIENT_SECRET');
        // If missing, try reading .env directly (consistent with redirect fallback)
        if (empty($clientId) || empty($clientSecret)) {
            $envPath = base_path('.env');
            if (is_readable($envPath)) {
                $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    if (strpos(trim($line), 'GOOGLE_CLIENT_ID=') === 0 && empty($clientId)) {
                        $parts = explode('=', $line, 2);
                        $val = trim($parts[1] ?? '');
                        $val = trim($val, " \t\n\r\0\x0B\"'");
                        if (!empty($val)) {
                            $clientId = $val;
                        }
                    }
                    if (strpos(trim($line), 'GOOGLE_CLIENT_SECRET=') === 0 && empty($clientSecret)) {
                        $parts = explode('=', $line, 2);
                        $val = trim($parts[1] ?? '');
                        $val = trim($val, " \t\n\r\0\x0B\"'");
                        if (!empty($val)) {
                            $clientSecret = $val;
                        }
                    }
                }
            }
        }

        $redirectUri = route('google.callback');
        // Log non-sensitive diagnostics to help debug token exchange failures
        Log::debug('Google OAuth callback diagnostics', [
            'has_client_id' => !empty($clientId),
            'has_client_secret' => !empty($clientSecret),
            'redirect_uri' => $redirectUri,
        ]);

        $http = Http::asForm();
        if (env('ALLOW_INSECURE_LOCAL_CURL', false)) {
            // disable SSL verification for local dev only
            $http = $http->withoutVerifying();
        }

        $postData = [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ];

        // Non-sensitive debug: log the outgoing token-exchange body with the client_secret masked
        try {
            $masked = $postData;
            if (! empty($masked['client_secret'])) {
                $masked['client_secret'] = '*****';
            }
            Log::debug('Google token POST', $masked);
        } catch (\Exception $e) {
            // don't let logging failures break the flow
            Log::debug('Failed to write masked Google token POST debug log', ['error' => $e->getMessage()]);
        }

        $resp = $http->post('https://oauth2.googleapis.com/token', $postData);

        if (! $resp->ok()) {
            Log::error('Google token exchange failed', ['status' => $resp->status(), 'body' => $resp->body()]);
            return response('Token exchange failed. Check logs for details.', 500);
        }

        $data = $resp->json();
        $refreshToken = $data['refresh_token'] ?? null;

        if (! $refreshToken) {
            // Sometimes Google only returns a refresh token on first consent or when prompt=consent is used.
            Log::warning('No refresh token returned by Google', $data);
            return response('No refresh token returned. Check logs.', 200);
        }

        // Persist refresh token to .env (Option A chosen by user). We'll append or replace the GMAIL_OAUTH_REFRESH_TOKEN entry.
        $envPath = base_path('.env');
        if (is_writable($envPath)) {
            $env = file_get_contents($envPath);
            if (strpos($env, 'GMAIL_OAUTH_REFRESH_TOKEN=') !== false) {
                $env = preg_replace('/GMAIL_OAUTH_REFRESH_TOKEN=.*\n?/', "GMAIL_OAUTH_REFRESH_TOKEN={$refreshToken}\n", $env);
            } else {
                $env .= "\nGMAIL_OAUTH_REFRESH_TOKEN={$refreshToken}\n";
            }
            file_put_contents($envPath, $env);

            // Reload config cache if present
            try {
                Artisan::call('config:clear');
                Artisan::call('config:cache');
            } catch (\Exception $e) {
                Log::warning('Failed to clear/cache config after writing env', ['exception' => $e->getMessage()]);
            }

            return response('Refresh token stored in .env. You can now use the test send route.', 200);
        }

        return response('Cannot write .env file. Please update GMAIL_OAUTH_REFRESH_TOKEN manually.', 500);
    }

    public function sendTest()
    {
        // Use the GmailApiService to send a simple test message to MAIL_FROM_ADDRESS
        try {
            $to = config('mail.from.address') ?? env('MAIL_FROM_ADDRESS');
            $subject = 'Test email via Gmail API';
            $body = "This is a test email sent from the application using a refresh token.";

            $service = app()->make(\App\Services\GmailApiService::class);
            $service->sendRawMessage($to, $subject, $body);

            return response('Test email queued (sent). Check the recipient inbox or logs.', 200);
        } catch (\Exception $e) {
            Log::error('Gmail sendTest failed', ['message' => $e->getMessage()]);
            return response('Send failed. Check logs for details.', 500);
        }
    }
}
