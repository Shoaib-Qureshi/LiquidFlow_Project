<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    public function definition(): array
    {
        $startsAt = $this->faker->dateTimeBetween('-10 days', 'now');
        $durationDays = $this->faker->randomElement([30, 365]);
        $endsAt = (clone $startsAt)->modify("+{$durationDays} days");

        return [
            'client_id' => Client::factory(),
            'plan_id' => Plan::factory(),
            'status' => 'active',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'renewal_token' => Str::uuid()->toString(),
            'external_reference' => 'sub_'.$this->faker->unique()->numerify('########'),
            'billing_cycle_count' => $this->faker->numberBetween(1, 24),
            'metadata' => [
                'source' => $this->faker->randomElement(['laravel', 'wordpress']),
            ],
            'last_synced_at' => now(),
        ];
    }
}
