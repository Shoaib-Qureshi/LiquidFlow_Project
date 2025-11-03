<?php

namespace App\Jobs\Integrations;

use App\Models\Client;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessWooCommerceSubscription implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly array $payload)
    {
    }

    public function handle(): void
    {
        DB::transaction(function () {
            $client = $this->findOrCreateClient();

            if (! $client) {
                return;
            }

            $this->upsertSubscription($client);
        });
    }

    protected function findOrCreateClient(): ?Client
    {
        $email = Arr::get($this->payload, 'customer.email');
        $company = Arr::get($this->payload, 'customer.company');
        $wordpressUserId = Arr::get($this->payload, 'customer.wordpress_user_id');

        if (! $email && ! $company) {
            return null;
        }

        $query = Client::query();

        if ($email) {
            $query->where(function (Builder $builder) use ($email) {
                $builder->where('contact_email', $email)
                    ->orWhere('stripe_customer_id', $email);
            });
        }

        if ($wordpressUserId) {
            $query->orWhere('wordpress_user_id', (int) $wordpressUserId);
        }

        $client = $query->first();

        if (! $client) {
            $name = Arr::get($this->payload, 'customer.name')
                ?: $company
                ?: 'Woo Subscription '.$this->payload['subscription_id'];

            $client = Client::create([
                'name' => $name,
                'slug' => Client::generateUniqueSlug($name),
                'status' => 'active',
                'origin' => 'woocommerce',
                'contact_email' => $email,
                'contact_phone' => Arr::get($this->payload, 'customer.phone'),
                'contact_company' => $company,
                'wordpress_user_id' => $wordpressUserId,
            ]);
        } else {
            $updates = [];

            if ($email && ! $client->contact_email) {
                $updates['contact_email'] = $email;
            }

            if ($company && ! $client->contact_company) {
                $updates['contact_company'] = $company;
            }

            $phone = Arr::get($this->payload, 'customer.phone');
            if ($phone && ! $client->contact_phone) {
                $updates['contact_phone'] = $phone;
            }

            if ($wordpressUserId && ! $client->wordpress_user_id) {
                $updates['wordpress_user_id'] = (int) $wordpressUserId;
            }

            if (! empty($updates)) {
                $client->fill($updates)->save();
            }
        }

        return $client;
    }

    protected function upsertSubscription(Client $client): void
    {
        $subscriptionId = (string) $this->payload['subscription_id'];
        $interval = Arr::get($this->payload, 'recurring.interval');
        $plan = $this->resolvePlan(
            Arr::get($this->payload, 'product.name'),
            $interval
        );

        Subscription::updateOrCreate(
            ['external_reference' => $this->externalReference($subscriptionId)],
            [
                'client_id' => $client->id,
                'plan_id' => $plan?->id,
                'status' => $this->mapStatus(Arr::get($this->payload, 'status')),
                'starts_at' => $this->parseDate(Arr::get($this->payload, 'started_on')),
                'ends_at' => $this->parseDate(Arr::get($this->payload, 'expires_on')),
                'cancelled_at' => $this->parseDate(Arr::get($this->payload, 'ended_on')),
                'renewed_at' => $this->parseDate(Arr::get($this->payload, 'payment_due_on')),
                'renewal_token' => Arr::get($this->payload, 'meta.renewal_token'),
                'billing_cycle_count' => (int) Arr::get($this->payload, 'renewals.count', 0),
                'metadata' => [
                    'woocommerce_subscription_id' => $subscriptionId,
                    'product_name' => Arr::get($this->payload, 'product.name'),
                    'currency' => Arr::get($this->payload, 'currency'),
                    'recurring_amount' => Arr::get($this->payload, 'recurring.amount'),
                    'recurring_interval' => $interval,
                    'payment_method' => Arr::get($this->payload, 'payment_method'),
                    'customer_email' => Arr::get($this->payload, 'customer.email'),
                    'customer_name' => Arr::get($this->payload, 'customer.name'),
                    'source' => 'woocommerce',
                    'meta' => Arr::get($this->payload, 'meta', []),
                ],
                'last_synced_at' => now(),
            ]
        );
    }

    protected function parseDate(?string $value): ?Carbon
    {
        if (empty($value)) {
            return null;
        }

        return Carbon::parse($value);
    }

    protected function mapStatus(?string $status): string
    {
        return match (Str::of((string) $status)->lower()->value()) {
            'active' => Subscription::STATUS_ACTIVE,
            'on-hold', 'pending-cancel', 'trial', 'trialing', 'pending' => Subscription::STATUS_GRACE,
            'expired' => Subscription::STATUS_EXPIRED,
            'cancelled', 'canceled' => Subscription::STATUS_CANCELLED,
            default => Subscription::STATUS_INACTIVE,
        };
    }

    protected function resolvePlan(?string $productName, ?string $interval): ?Plan
    {
        if (blank($productName)) {
            return null;
        }

        $normalizedInterval = $this->normalizeInterval($interval);
        $normalizedName = Str::of($productName)->lower();

        $keyword = collect(['starter', 'business', 'agency'])->first(function (string $candidate) use ($normalizedName) {
            return $normalizedName->contains($candidate);
        });

        if (! $keyword) {
            return null;
        }

        $slug = $normalizedInterval
            ? "{$keyword}-{$normalizedInterval}"
            : $keyword;

        return Plan::where('slug', $slug)->first();
    }

    protected function normalizeInterval(?string $interval): ?string
    {
        if (! $interval) {
            return null;
        }

        return match (Str::of($interval)->lower()->value()) {
            'month', 'monthly' => 'monthly',
            'year', 'yearly', 'annual', 'annually' => 'yearly',
            default => null,
        };
    }

    protected function externalReference(string $subscriptionId): string
    {
        return 'woo:'.$subscriptionId;
    }
}
