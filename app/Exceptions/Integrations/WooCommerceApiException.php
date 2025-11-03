<?php

namespace App\Exceptions\Integrations;

use Illuminate\Http\Client\Response;
use RuntimeException;

class WooCommerceApiException extends RuntimeException
{
    public ?Response $response;

    public function __construct(string $message, ?Response $response = null)
    {
        parent::__construct($message, $response?->status() ?? 0);

        $this->response = $response;
    }

    /**
     * Convenience accessor for the decoded JSON response, if available.
     *
     * @return mixed
     */
    public function json()
    {
        return $this->response?->json();
    }
}
