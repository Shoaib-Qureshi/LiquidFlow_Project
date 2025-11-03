<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WooCommerceOrder extends Model
{
    use HasFactory;

    protected $table = 'woocommerce_orders';

    protected $fillable = [
        'woocommerce_order_id',
        'client_id',
        'status',
        'currency',
        'total',
        'stripe_payment_intent_id',
        'stripe_subscription_id',
        'payload',
        'ordered_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'ordered_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
