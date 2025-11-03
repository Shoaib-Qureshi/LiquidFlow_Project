<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('woocommerce_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('woocommerce_order_id')->unique();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('status')->nullable();
            $table->string('currency', 3)->default('USD');
            $table->decimal('total', 12, 2)->default(0);
            $table->string('stripe_payment_intent_id')->nullable()->index();
            $table->string('stripe_subscription_id')->nullable()->index();
            $table->json('payload')->nullable();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('woocommerce_orders');
    }
};
