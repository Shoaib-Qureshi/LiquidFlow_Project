<?php

namespace App\Http\Requests\Integrations;

use Illuminate\Foundation\Http\FormRequest;

class StoreWooCommerceOrderRequest extends FormRequest
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
            'order_id' => ['required', 'integer'],
            'order_number' => ['nullable', 'string'],
            'currency' => ['required', 'string', 'size:3'],
            'total' => ['required', 'numeric'],
            'status' => ['nullable', 'string'],
            'processed_at' => ['nullable', 'date'],
            'customer.email' => ['required', 'email'],
            'customer.first_name' => ['nullable', 'string'],
            'customer.last_name' => ['nullable', 'string'],
            'customer.id' => ['nullable', 'integer'],
            'customer.wordpress_user_id' => ['nullable', 'integer'],
            'customer.stripe_customer_id' => ['nullable', 'string'],
            'billing.address_1' => ['nullable', 'string'],
            'billing.address_2' => ['nullable', 'string'],
            'billing.city' => ['nullable', 'string'],
            'billing.state' => ['nullable', 'string'],
            'billing.postcode' => ['nullable', 'string'],
            'billing.country' => ['nullable', 'string', 'size:2'],
            'billing.phone' => ['nullable', 'string'],
            'billing.company' => ['nullable', 'string'],
            'stripe.payment_intent_id' => ['nullable', 'string'],
            'stripe.charge_id' => ['nullable', 'string'],
            'stripe.subscription_id' => ['nullable', 'string'],
            'line_items' => ['sometimes', 'array'],
            'line_items.*.product_id' => ['nullable', 'integer'],
            'line_items.*.product_name' => ['nullable', 'string'],
            'line_items.*.quantity' => ['nullable', 'integer'],
        ];
    }

    protected function failedAuthorization(): void
    {
        abort(401, 'Invalid WooCommerce signature.');
    }
}
