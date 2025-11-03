<?php

namespace App\Jobs\Integrations;

use App\Models\Client;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\WooCommerceOrder;
use App\Notifications\ClientManagerInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProcessWooCommerceOrder implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly array $payload,
    ) {
    }

    public function handle(): void
    {
        DB::transaction(function () {
            $client = $this->findOrCreateClient();

            $this->upsertOrder($client);
            $this->ensureManagerUser($client);
            $this->syncSubscriptionFromOrder($client);
        });
    }

    protected function findOrCreateClient(): Client
    {
        $stripeCustomerId = Arr::get($this->payload, 'customer.stripe_customer_id');
        $email = Arr::get($this->payload, 'customer.email');
        $woocommerceCustomerId = $this->nullableInt(Arr::get($this->payload, 'customer.id'));

        if (! $stripeCustomerId && ! $email && ! $woocommerceCustomerId) {
            return $this->createClient();
        }

        $client = Client::query()
            ->where(function (Builder $query) use ($stripeCustomerId, $email, $woocommerceCustomerId) {
                if ($stripeCustomerId) {
                    $query->orWhere('stripe_customer_id', $stripeCustomerId);
                }

                if ($email) {
                    $query->orWhere('contact_email', $email);
                }

                if ($woocommerceCustomerId) {
                    $query->orWhere('woocommerce_customer_id', $woocommerceCustomerId);
                }
            })
            ->first();

        if (! $client) {
            return $this->createClient();
        }

        $updates = [];

        if ($stripeCustomerId && ! $client->stripe_customer_id) {
            $updates['stripe_customer_id'] = $stripeCustomerId;
        }

        if ($email && ! $client->contact_email) {
            $updates['contact_email'] = $email;
        }

        $contactPhone = Arr::get($this->payload, 'billing.phone');
        if ($contactPhone && ! $client->contact_phone) {
            $updates['contact_phone'] = $contactPhone;
        }

        $contactCompany = Arr::get($this->payload, 'billing.company');
        if ($contactCompany && ! $client->contact_company) {
            $updates['contact_company'] = $contactCompany;
        }

        $wordpressUserId = $this->nullableInt(Arr::get($this->payload, 'customer.wordpress_user_id'));
        if ($wordpressUserId && $client->wordpress_user_id !== $wordpressUserId) {
            $updates['wordpress_user_id'] = $wordpressUserId;
        }

        if ($woocommerceCustomerId && $client->woocommerce_customer_id !== $woocommerceCustomerId) {
            $updates['woocommerce_customer_id'] = $woocommerceCustomerId;
        }

        $integrationMeta = $this->buildIntegrationMeta();
        if (! empty($integrationMeta)) {
            $updates['integration_meta'] = array_merge($client->integration_meta ?? [], $integrationMeta);
        }

        if ($client->origin === 'internal') {
            $updates['origin'] = 'woocommerce';
        }

        if (! empty($updates)) {
            $client->fill($updates);
            $client->save();
        }

        return $client;
    }

    protected function createClient(): Client
    {
        $name = $this->resolveClientName();

        return Client::create([
            'name' => $name,
            'slug' => Client::generateUniqueSlug($name),
            'status' => 'active',
            'origin' => 'woocommerce',
            'contact_email' => Arr::get($this->payload, 'customer.email'),
            'contact_phone' => Arr::get($this->payload, 'billing.phone'),
            'contact_company' => Arr::get($this->payload, 'billing.company'),
            'stripe_customer_id' => Arr::get($this->payload, 'customer.stripe_customer_id'),
            'wordpress_user_id' => $this->nullableInt(Arr::get($this->payload, 'customer.wordpress_user_id')),
            'woocommerce_customer_id' => $this->nullableInt(Arr::get($this->payload, 'customer.id')),
            'integration_meta' => $this->buildIntegrationMeta(),
        ]);
    }

    protected function resolveClientName(): string
    {
        $nameParts = array_filter([
            Arr::get($this->payload, 'customer.first_name'),
            Arr::get($this->payload, 'customer.last_name'),
        ]);

        if (! empty($nameParts)) {
            return implode(' ', $nameParts);
        }

        if ($company = Arr::get($this->payload, 'billing.company')) {
            return $company;
        }

        if ($email = Arr::get($this->payload, 'customer.email')) {
            return explode('@', $email)[0];
        }

        return 'Woo Customer '.Arr::get($this->payload, 'order_id', 'unknown');
    }

    protected function upsertOrder(Client $client): void
    {
        WooCommerceOrder::updateOrCreate(
            [
                'woocommerce_order_id' => (int) Arr::get($this->payload, 'order_id'),
            ],
            [
                'client_id' => $client->id,
                'status' => Arr::get($this->payload, 'status'),
                'currency' => Arr::get($this->payload, 'currency', 'USD'),
                'total' => (float) Arr::get($this->payload, 'total', 0),
                'stripe_payment_intent_id' => Arr::get($this->payload, 'stripe.payment_intent_id'),
                'stripe_subscription_id' => Arr::get($this->payload, 'stripe.subscription_id'),
                'payload' => $this->payload,
                'ordered_at' => Arr::get($this->payload, 'processed_at'),
            ]
        );
    }

    protected function ensureManagerUser(Client $client): void
    {
        $email = $client->contact_email ?? Arr::get($this->payload, 'customer.email');

        if (! $email) {
            return;
        }

        $user = User::where('email', $email)->first();
        $temporaryPassword = null;

        if (! $user) {
            $temporaryPassword = Str::password(16);
            $user = User::create([
                'name' => $client->name,
                'email' => $email,
                'password' => Hash::make($temporaryPassword),
                'email_verified_at' => now(),
            ]);

            $user->assignRole('Manager');
        } elseif (! $user->hasRole('Manager')) {
            $user->assignRole('Manager');
        }

        if ($client->manager_user_id !== $user->id) {
            $client->manager_user_id = $user->id;
            $client->save();
        }

        if ($temporaryPassword) {
            $user->notify(new ClientManagerInvite($client, $temporaryPassword));
        }
    }

    protected function syncSubscriptionFromOrder(Client $client): void
    {
        $orderId = Arr::get($this->payload, 'order_id');
        $lineItems = Arr::get($this->payload, 'line_items', []);
        $rawStatus = Arr::get($this->payload, 'status');
        $status = $this->mapOrderStatus($rawStatus);

        if (! $orderId || empty($lineItems)) {
            return;
        }

        if ($this->hasRealSubscription($client, $orderId)) {
            $this->updateRealSubscriptionFromOrder($client, $orderId, $status, $rawStatus);
            return;
        }

        $startsAt = $this->parseDate(Arr::get($this->payload, 'processed_at')) ?? now();
        $plan = $this->resolvePlanFromOrder($lineItems);
        $planId = $plan?->id;
        $durationDays = $plan?->duration_days;
        $endsAt = $durationDays ? (clone $startsAt)->addDays($durationDays) : null;
        $lineItem = Arr::first($lineItems);
        $recurringAmount = $plan?->price
            ?? (float) Arr::get($lineItem, 'total')
            ?? (float) Arr::get($this->payload, 'total', 0);
        $recurringInterval = $plan?->interval
            ?? Arr::get($this->payload, 'recurring.interval')
            ?? 'custom';

        Subscription::updateOrCreate(
            ['external_reference' => 'woo-order:'.$orderId],
            [
                'client_id' => $client->id,
                'plan_id' => $planId,
                'status' => $status,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'renewed_at' => $endsAt,
                'billing_cycle_count' => 0,
                'cancelled_at' => $status === Subscription::STATUS_CANCELLED ? now() : null,
                'metadata' => [
                    'source' => 'woocommerce_order_fallback',
                    'woocommerce_order_id' => $orderId,
                    'product_id' => Arr::get($lineItem, 'product_id'),
                    'product_name' => Arr::get($lineItem, 'product_name'),
                    'currency' => Arr::get($this->payload, 'currency'),
                    'recurring_amount' => $recurringAmount,
                    'recurring_interval' => $recurringInterval,
                    'order_total' => Arr::get($this->payload, 'total'),
                    'customer_email' => $client->contact_email,
                    'customer_name' => $client->name,
                    'status_source' => Arr::get($this->payload, 'status'),
                ],
                'last_synced_at' => now(),
            ]
        );
    }

    protected function hasRealSubscription(Client $client, mixed $orderId): bool
    {
        return Subscription::query()
            ->where('client_id', $client->id)
            ->where(function (Builder $builder) use ($orderId) {
                $builder->where('external_reference', 'woo:'.$orderId)
                    ->orWhereJsonContains('metadata->woocommerce_subscription_id', (string) $orderId);
            })
            ->exists();
    }

    protected function updateRealSubscriptionFromOrder(Client $client, mixed $orderId, string $status, ?string $rawStatus): void
    {
        $subscription = Subscription::query()
            ->where('client_id', $client->id)
            ->where(function (Builder $builder) use ($orderId) {
                $builder->where('external_reference', 'woo:'.$orderId)
                    ->orWhereJsonContains('metadata->woocommerce_subscription_id', (string) $orderId);
            })
            ->first();

        if (! $subscription) {
            return;
        }

        $metadata = $subscription->metadata ?? [];
        $metadata['last_order_status'] = $status;
        if ($rawStatus !== null) {
            $metadata['last_raw_order_status'] = $rawStatus;
        }
        $metadata['order_status_synced_at'] = now()->toIso8601String();
        $metadata['order_total'] = Arr::get($this->payload, 'total', $metadata['order_total'] ?? null);
        $metadata['currency'] = Arr::get($this->payload, 'currency', $metadata['currency'] ?? null);

        $updates = [
            'status' => $status,
            'metadata' => $metadata,
            'last_synced_at' => now(),
        ];

        if ($status === Subscription::STATUS_CANCELLED) {
            $updates['cancelled_at'] = $subscription->cancelled_at ?? now();
        } elseif ($status === Subscription::STATUS_ACTIVE) {
            $updates['cancelled_at'] = null;
        }

        $subscription->fill($updates)->save();
    }

    protected function resolvePlanFromOrder(array $lineItems): ?Plan
    {
        if (empty($lineItems)) {
            return null;
        }

        $lineItem = Arr::first($lineItems);
        $productId = Arr::get($lineItem, 'product_id');
        $productName = Str::of(Arr::get($lineItem, 'product_name', ''))->lower()->trim();
        $orderTotal = (float) Arr::get($this->payload, 'total', 0);

        $mappedPlanSlug = null;
        $productPlanMap = config('services.woocommerce.product_plan_map', []);

        if ($productId && isset($productPlanMap[$productId])) {
            $mappedPlanSlug = $productPlanMap[$productId];
        }

        if (! $mappedPlanSlug && isset($productPlanMap[(string) $productId])) {
            $mappedPlanSlug = $productPlanMap[(string) $productId];
        }

        if ($mappedPlanSlug) {
            return Plan::where('slug', $mappedPlanSlug)->first();
        }

        $plans = Plan::active()->get();

        $matchesByName = $plans->filter(function (Plan $plan) use ($productName) {
            return $productName !== '' && Str::of($plan->name)->lower()->contains($productName);
        });

        if ($matchesByName->count() === 1) {
            return $matchesByName->first();
        }

        if ($matchesByName->count() > 1) {
            return $matchesByName->sortBy(function (Plan $plan) use ($orderTotal) {
                return abs($plan->price - $orderTotal);
            })->first();
        }

        return $plans->sortBy(function (Plan $plan) use ($orderTotal) {
            return abs($plan->price - $orderTotal);
        })->first();
    }

    protected function mapOrderStatus(?string $status): string
    {
        return match (Str::of((string) $status)->lower()->value()) {
            'completed', 'processing' => Subscription::STATUS_ACTIVE,
            'pending', 'on-hold' => Subscription::STATUS_GRACE,
            'cancelled', 'canceled', 'refunded', 'failed', 'trash', 'trashed', 'deleted' => Subscription::STATUS_CANCELLED,
            default => Subscription::STATUS_INACTIVE,
        };
    }

    protected function parseDate(?string $value): ?Carbon
    {
        if (empty($value)) {
            return null;
        }

        return Carbon::parse($value);
    }

    protected function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    protected function buildIntegrationMeta(): array
    {
        return array_filter([
            'last_woocommerce_order_id' => Arr::get($this->payload, 'order_id'),
            'last_woocommerce_status' => Arr::get($this->payload, 'status'),
            'last_order_total' => Arr::get($this->payload, 'total'),
            'woocommerce_url' => Arr::get($this->payload, 'links.admin_url'),
        ], fn ($value) => $value !== null);
    }
}
