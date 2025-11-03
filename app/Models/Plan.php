<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'tagline',
        'description',
        'price',
        'interval',
        'duration_days',
        'is_recommended',
        'features',
        'metadata',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'is_recommended' => 'boolean',
        'features' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
