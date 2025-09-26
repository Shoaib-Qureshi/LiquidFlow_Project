<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GmailApiService
{
    protected function getAccessToken()
    {
        $refreshToken = config('services.google.refresh_token') ?? env('GMAIL_OAUTH_REFRESH_TOKEN');
        $clientId = config('services.google.client_id') ?? env('GOOGLE_CLIENT_ID');
        $clientSecret = config('services.google.client_secret') ?? env('GOOGLE_CLIENT_SECRET');

        if (! $refreshToken || ! $clientId || ! $clientSecret) {
            throw new \RuntimeException('Missing Google OAuth configuration (client id/secret/refresh token)');
        }

        $http = Http::asForm();
        if (env('ALLOW_INSECURE_LOCAL_CURL', false)) {
            $http = $http->withoutVerifying();
        }

        $resp = $http->post('https://oauth2.googleapis.com/token', [
            'refresh_token' => $refreshToken,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'grant_type' => 'refresh_token',
        ]);

        if (! $resp->ok()) {
            Log::error('Failed to get access token from Google', ['status' => $resp->status(), 'body' => $resp->body()]);
            throw new \RuntimeException('Failed to exchange refresh token for access token');
        }

        $data = $resp->json();
        return $data['access_token'] ?? null;
    }

    public function sendRawMessage(string $to, string $subject, string $body)
    {
        $from = config('mail.from.address') ?? env('MAIL_FROM_ADDRESS');

        $mime = "From: {$from}\r\n";
        $mime .= "To: {$to}\r\n";
        $mime .= "Subject: {$subject}\r\n";
        $mime .= "MIME-Version: 1.0\r\n";

        // If body looks like HTML (contains tags), send as HTML. Otherwise send plain text.
        $isHtml = strip_tags($body) !== $body;
        if ($isHtml) {
            $mime .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
            $mime .= "Content-Transfer-Encoding: 7bit\r\n";
            $mime .= "\r\n";
            $mime .= $body;
        } else {
            $mime .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
            $mime .= "\r\n";
            $mime .= $body;
        }

        // Gmail expects URL-safe base64 encoding
        $raw = rtrim(strtr(base64_encode($mime), '+/', '-_'), '=');

        $accessToken = $this->getAccessToken();
        if (! $accessToken) {
            throw new \RuntimeException('No access token obtained');
        }

        $http2 = Http::withHeaders([
            'Authorization' => "Bearer {$accessToken}",
            'Content-Type' => 'application/json',
        ]);
        if (env('ALLOW_INSECURE_LOCAL_CURL', false)) {
            $http2 = $http2->withoutVerifying();
        }

        $resp = $http2->post('https://www.googleapis.com/gmail/v1/users/me/messages/send', [
            'raw' => $raw,
        ]);

        if (! $resp->ok()) {
            Log::error('Gmail API send failed', ['status' => $resp->status(), 'body' => $resp->body()]);
            throw new \RuntimeException('Gmail API send failed');
        }

        // Log success (message id/threadId) to aid verification in logs
        try {
            Log::info('Gmail API send success', ['body' => $resp->body()]);
        } catch (\Exception $e) {
            // keep silent on logging failure
        }

        return $resp->json();
    }
}
