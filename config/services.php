<?php

return [
    // Other services can be added here as needed
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'refresh_token' => env('GMAIL_OAUTH_REFRESH_TOKEN'),
    ],
    'woocommerce' => [
        'signing_secret' => env('WOO_SYNC_SIGNING_SECRET'),
        'signature_ttl' => env('WOO_SYNC_SIGNATURE_TTL', 300),
        'api_url' => env('WOO_API_URL'),
        'key' => env('WOO_API_KEY'),
        'secret' => env('WOO_API_SECRET'),
        'timeout' => env('WOO_API_TIMEOUT', 30),
        'product_plan_map' => array_filter(
            json_decode(env('WOO_PRODUCT_PLAN_MAP', '[]'), true) ?? [],
            fn ($value) => ! empty($value)
        ),
    ],
];
