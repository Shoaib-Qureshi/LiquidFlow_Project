<?php

namespace App\Services\Integrations;

use App\Exceptions\Integrations\WooCommerceApiException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class WooCommerceApiService
{
    protected PendingRequest $http;

    /**
     * @var array<string, mixed>
     */
    protected array $config;

    public function __construct(HttpFactory $httpFactory)
    {
        $this->config = config('services.woocommerce', []);

        $baseUrl = rtrim((string) Arr::get($this->config, 'api_url'), '/');
        $key = Arr::get($this->config, 'key');
        $secret = Arr::get($this->config, 'secret');

        if (blank($baseUrl) || blank($key) || blank($secret)) {
            throw new WooCommerceApiException(
                'WooCommerce API configuration is incomplete. Please set WOO_API_URL, WOO_API_KEY, and WOO_API_SECRET.'
            );
        }

        $timeout = (int) Arr::get($this->config, 'timeout', 30);

        $this->http = $httpFactory
            ->baseUrl($baseUrl)
            ->withBasicAuth($key, $secret)
            ->acceptJson()
            ->asJson()
            ->withOptions(['timeout' => $timeout]);
    }

    /**
     * Retrieve a single WooCommerce subscription by ID.
     *
     * @return array<string, mixed>
     */
    public function getSubscription(int|string $subscriptionId, array $query = []): array
    {
        return $this->get(
            $this->endpoint('subscriptions/'.$subscriptionId),
            $query
        );
    }

    /**
     * Retrieve a list of WooCommerce subscriptions.
     *
     * @return array<int, mixed>
     */
    public function listSubscriptions(array $query = []): array
    {
        return $this->get($this->endpoint('subscriptions'), $query);
    }

    /**
     * Retrieve a single WooCommerce order by ID.
     *
     * @return array<string, mixed>
     */
    public function getOrder(int|string $orderId, array $query = []): array
    {
        return $this->get(
            $this->endpoint('orders/'.$orderId),
            $query
        );
    }

    /**
     * Retrieve WooCommerce orders.
     *
     * @return array<int, mixed>
     */
    public function listOrders(array $query = []): array
    {
        return $this->get($this->endpoint('orders'), $query);
    }

    /**
     * Perform a GET request.
     *
     * @return array<int|string, mixed>
     */
    protected function get(string $endpoint, array $query = []): array
    {
        $response = $this->http
            ->clone()
            ->get($endpoint, $query);

        return $this->handleResponse($response);
    }

    /**
     * Perform a POST request.
     *
     * @return array<int|string, mixed>
     */
    protected function post(string $endpoint, array $payload = []): array
    {
        $response = $this->http
            ->clone()
            ->post($endpoint, $payload);

        return $this->handleResponse($response);
    }

    /**
     * Perform a PUT request.
     *
     * @return array<int|string, mixed>
     */
    protected function put(string $endpoint, array $payload = []): array
    {
        $response = $this->http
            ->clone()
            ->put($endpoint, $payload);

        return $this->handleResponse($response);
    }

    /**
     * Perform a DELETE request.
     *
     * @return array<int|string, mixed>
     */
    protected function delete(string $endpoint, array $query = []): array
    {
        $response = $this->http
            ->clone()
            ->delete($endpoint, $query);

        return $this->handleResponse($response);
    }

    protected function handleResponse(Response $response): array
    {
        if ($response->failed()) {
            throw new WooCommerceApiException(
                sprintf(
                    'WooCommerce API request failed with status %s: %s',
                    $response->status(),
                    $response->body()
                ),
                $response
            );
        }

        $json = $response->json();

        if (! is_array($json)) {
            throw new WooCommerceApiException('WooCommerce API returned an unexpected response shape.', $response);
        }

        return $json;
    }

    protected function endpoint(string $path): string
    {
        $path = Str::start($path, '/');

        return trim($path, '/');
    }
}
