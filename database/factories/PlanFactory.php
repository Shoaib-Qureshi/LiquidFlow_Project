<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->randomElement(['Starter', 'Business', 'Agency']);
        $interval = $this->faker->randomElement(['monthly', 'yearly']);

        return [
            'name' => "{$name} ".ucfirst($interval),
            'slug' => Str::slug("{$name} {$interval}".' '.Str::random(3)),
            'tagline' => $this->faker->sentence(6),
            'description' => $this->faker->paragraph(),
            'price' => $interval === 'monthly'
                ? $this->faker->randomElement([450, 1200, 2200])
                : $this->faker->randomElement([382.5, 1020, 1870]),
            'interval' => $interval,
            'duration_days' => $interval === 'monthly' ? 30 : 365,
            'is_recommended' => $name === 'Business' && $interval === 'monthly',
            'features' => [
                'turnaround_time' => $this->faker->randomElement([
                    '1 business day',
                    '2 business days',
                    '4 business days',
                ]),
                'email_support' => true,
            ],
            'metadata' => [
                'cta' => 'Get Started',
            ],
            'display_order' => $this->faker->numberBetween(1, 6),
            'is_active' => true,
        ];
    }
}
