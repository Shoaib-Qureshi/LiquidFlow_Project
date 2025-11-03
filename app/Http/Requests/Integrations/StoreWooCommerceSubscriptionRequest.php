<?php

namespace App\Http\Requests\Integrations;

use Illuminate\Foundation\Http\FormRequest;

class StoreWooCommerceSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $secret = config('services.woocommerce.signing_secret');
        if (empty($secret)) {
            return true;
        }

        $signature = $this->headers->get('X-LF-Signature');
        $timestamp = $this->headers->get('X-LF-Timestamp');

        if (! $signature || ! $timestamp || ! ctype_digit((string) $timestamp)) {
            return false;
        }

        $skew = (int) config('services.woocommerce.signature_ttl', 300);

        if (abs(time() - (int) $timestamp) > $skew) {
            return false;
        }

        $signedPayload = $timestamp.'.'.$this->getContent();
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expectedSignature, $signature);
    }

    public function rules(): array
    {
        return [
            'subscription_id' => ['required', 'integer'],
            'status' => ['nullable', 'string'],
            'product.name' => ['nullable', 'string'],
            'currency' => ['nullable', 'string', 'size:3'],
            'recurring.amount' => ['nullable', 'numeric'],
            'recurring.interval' => ['nullable', 'string'],
            'started_on' => ['nullable', 'date'],
            'payment_due_on' => ['nullable', 'date'],
            'expires_on' => ['nullable', 'date'],
            'ended_on' => ['nullable', 'date'],
            'renewals.count' => ['nullable', 'integer'],
            'failed_attempts' => ['nullable', 'integer'],
            'payment_method' => ['nullable', 'string'],
            'customer.email' => ['nullable', 'email'],
            'customer.name' => ['nullable', 'string'],
            'customer.company' => ['nullable', 'string'],
            'customer.phone' => ['nullable', 'string'],
            'customer.wordpress_user_id' => ['nullable', 'integer'],
            'meta' => ['nullable', 'array'],
        ];
    }

    protected function failedAuthorization(): void
    {
        abort(401, 'Invalid WooCommerce signature.');
    }
}
