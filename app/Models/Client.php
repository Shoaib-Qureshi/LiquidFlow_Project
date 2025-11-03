<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'status',
        'origin',
        'logo_path',
        'website',
        'contact_email',
        'contact_phone',
        'contact_company',
        'stripe_customer_id',
        'wordpress_user_id',
        'woocommerce_customer_id',
        'description',
        'notes',
        'integration_meta',
        'created_by',
        'updated_by',
        'manager_user_id',
    ];

    protected $casts = [
        'wordpress_user_id' => 'integer',
        'woocommerce_customer_id' => 'integer',
        'integration_meta' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Brands associated with the client.
     */
    public function brands(): HasMany
    {
        return $this->hasMany(Brand::class);
    }

    public function woocommerceOrders(): HasMany
    {
        return $this->hasMany(WooCommerceOrder::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            $baseSlug = Str::random(8);
        }

        $slug = $baseSlug;
        $counter = 1;

        while (
            static::where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter++;
        }

        return $slug;
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany('starts_at');
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where('status', Subscription::STATUS_ACTIVE);
    }

    /**
     * User who created the client.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated the client.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
