<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('inactive');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('renewed_at')->nullable();
            $table->string('renewal_token')->nullable();
            $table->string('external_reference')->nullable();
            $table->unsignedInteger('billing_cycle_count')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->index(['client_id', 'status']);
            $table->index(['status', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
