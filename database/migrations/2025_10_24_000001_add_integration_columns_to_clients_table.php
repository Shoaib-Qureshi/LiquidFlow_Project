<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('origin', 50)->default('internal')->after('status');
            $table->string('stripe_customer_id')->nullable()->after('contact_phone');
            $table->unsignedBigInteger('wordpress_user_id')->nullable()->after('stripe_customer_id');
            $table->unsignedBigInteger('woocommerce_customer_id')->nullable()->after('wordpress_user_id');
            $table->json('integration_meta')->nullable()->after('notes');

            $table->unique('stripe_customer_id', 'clients_stripe_customer_id_unique');
            $table->index('wordpress_user_id', 'clients_wordpress_user_id_index');
            $table->index('woocommerce_customer_id', 'clients_woocommerce_customer_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique('clients_stripe_customer_id_unique');
            $table->dropIndex('clients_wordpress_user_id_index');
            $table->dropIndex('clients_woocommerce_customer_id_index');

            $table->dropColumn([
                'origin',
                'stripe_customer_id',
                'wordpress_user_id',
                'woocommerce_customer_id',
                'integration_meta',
            ]);
        });
    }
};
