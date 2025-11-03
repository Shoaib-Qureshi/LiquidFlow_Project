<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;

class Subscription extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_GRACE = 'grace';

    protected $fillable = [
        'client_id',
        'plan_id',
        'status',
        'starts_at',
        'ends_at',
        'cancelled_at',
        'renewed_at',
        'renewal_token',
        'external_reference',
        'billing_cycle_count',
        'metadata',
        'last_synced_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'renewed_at' => 'datetime',
        'last_synced_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected $appends = [
        'product_name',
        'currency',
        'recurring_amount',
        'recurring_interval',
        'payment_method',
        'customer_email',
        'customer_name',
        'payment_due_on',
        'expires_on',
        'started_on',
        'ended_on',
        'renewals_count',
        'failed_attempts',
        'woocommerce_subscription_id',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        if ($this->status === self::STATUS_CANCELLED) {
            return false;
        }

        if ($this->status === self::STATUS_ACTIVE || $this->status === self::STATUS_GRACE) {
            if (! $this->ends_at instanceof CarbonInterface) {
                return true;
            }

            return $this->ends_at->isFuture();
        }

        return false;
    }

    public function isExpired(): bool
    {
        if (! $this->ends_at instanceof CarbonInterface) {
            return $this->status === self::STATUS_EXPIRED;
        }

        return $this->ends_at->isPast() || $this->status === self::STATUS_EXPIRED;
    }

    public function daysRemaining(): ?int
    {
        if (! $this->ends_at instanceof CarbonInterface) {
            return null;
        }

        if ($this->ends_at->isPast()) {
            return 0;
        }

        return (int) now()->diffInDays($this->ends_at);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', self::STATUS_EXPIRED);
    }

    public function getProductNameAttribute(): ?string
    {
        return $this->metadataAttribute('product_name');
    }

    public function getCurrencyAttribute(): ?string
    {
        return $this->metadataAttribute('currency');
    }

    public function getRecurringAmountAttribute(): ?float
    {
        $value = $this->metadataAttribute('recurring_amount');

        return $value !== null ? (float) $value : null;
    }

    public function getRecurringIntervalAttribute(): ?string
    {
        return $this->metadataAttribute('recurring_interval');
    }

    public function getPaymentMethodAttribute(): ?string
    {
        return $this->metadataAttribute('payment_method');
    }

    public function getCustomerEmailAttribute(): ?string
    {
        return $this->metadataAttribute('customer_email');
    }

    public function getCustomerNameAttribute(): ?string
    {
        return $this->metadataAttribute('customer_name');
    }

    public function getPaymentDueOnAttribute(): ?CarbonInterface
    {
        return $this->renewed_at;
    }

    public function getExpiresOnAttribute(): ?CarbonInterface
    {
        return $this->ends_at;
    }

    public function getStartedOnAttribute(): ?CarbonInterface
    {
        return $this->starts_at;
    }

    public function getEndedOnAttribute(): ?CarbonInterface
    {
        return $this->cancelled_at;
    }

    public function getRenewalsCountAttribute(): int
    {
        return (int) $this->billing_cycle_count;
    }

    public function getFailedAttemptsAttribute(): int
    {
        return (int) $this->metadataAttribute('failed_attempts', 0);
    }

    public function getWoocommerceSubscriptionIdAttribute(): ?string
    {
        return $this->metadataAttribute('woocommerce_subscription_id');
    }

    protected function metadataAttribute(string $key, $default = null)
    {
        return Arr::get($this->metadata ?? [], $key, $default);
    }
}
