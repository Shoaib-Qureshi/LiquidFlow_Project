<?php

return [
    // Other services can be added here as needed
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'refresh_token' => env('GMAIL_OAUTH_REFRESH_TOKEN'),
    ],
];
