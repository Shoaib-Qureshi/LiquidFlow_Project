<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter Monthly',
                'slug' => 'starter-monthly',
                'tagline' => 'Essential creative support for emerging brands.',
                'description' => 'Unlimited design requests with a four business day turnaround and email support.',
                'price' => 450,
                'interval' => 'monthly',
                'duration_days' => 30,
                'is_recommended' => false,
                'features' => $this->baseFeatures([
                    'turnaround_time' => '4 business days',
                    'priority_email_support' => false,
                    'slack_support' => false,
                    'dedicated_account_manager' => false,
                    'multi_brand_portal' => false,
                    'advanced_graphics' => false,
                    'monthly_design_consultation' => false,
                ]),
                'metadata' => [
                    'checkout_url' => null,
                ],
            ],
            [
                'name' => 'Business Monthly',
                'slug' => 'business-monthly',
                'tagline' => 'Our most popular plan for growing teams.',
                'description' => 'Accelerated turnaround times and collaborative support channels for fast-moving teams.',
                'price' => 1200,
                'interval' => 'monthly',
                'duration_days' => 30,
                'is_recommended' => true,
                'features' => $this->baseFeatures([
                    'turnaround_time' => '2 business days',
                    'priority_email_support' => true,
                    'slack_support' => true,
                    'dedicated_account_manager' => false,
                    'multi_brand_portal' => true,
                    'advanced_graphics' => true,
                    'monthly_design_consultation' => false,
                ]),
                'metadata' => [
                    'checkout_url' => null,
                ],
            ],
            [
                'name' => 'Agency Monthly',
                'slug' => 'agency-monthly',
                'tagline' => 'Premium creative capacity for agencies and enterprises.',
                'description' => 'Same-day turnarounds, advanced graphics, and a dedicated account manager for complex teams.',
                'price' => 2200,
                'interval' => 'monthly',
                'duration_days' => 30,
                'is_recommended' => false,
                'features' => $this->baseFeatures([
                    'turnaround_time' => '1 business day',
                    'priority_email_support' => true,
                    'slack_support' => true,
                    'dedicated_account_manager' => true,
                    'multi_brand_portal' => true,
                    'advanced_graphics' => true,
                    'monthly_design_consultation' => true,
                ]),
                'metadata' => [
                    'checkout_url' => null,
                ],
            ],
            [
                'name' => 'Starter Yearly',
                'slug' => 'starter-yearly',
                'tagline' => 'Starter value with annual savings baked in.',
                'description' => 'Commit for the year and save 15% on the Starter plan.',
                'price' => 382.50,
                'interval' => 'yearly',
                'duration_days' => 365,
                'is_recommended' => false,
                'features' => $this->baseFeatures([
                    'turnaround_time' => '4 business days',
                    'priority_email_support' => false,
                    'slack_support' => false,
                    'dedicated_account_manager' => false,
                    'multi_brand_portal' => false,
                    'advanced_graphics' => false,
                    'monthly_design_consultation' => false,
                ]),
                'metadata' => [
                    'checkout_url' => null,
                    'annual_discount' => 'Save 15%',
                    'compares_to_monthly' => 450,
                ],
            ],
            [
                'name' => 'Business Yearly',
                'slug' => 'business-yearly',
                'tagline' => 'Popular plan with annual savings.',
                'description' => 'Keep the team moving quickly with discounted annual billing.',
                'price' => 1020,
                'interval' => 'yearly',
                'duration_days' => 365,
                'is_recommended' => true,
                'features' => $this->baseFeatures([
                    'turnaround_time' => '2 business days',
                    'priority_email_support' => true,
                    'slack_support' => true,
                    'dedicated_account_manager' => false,
                    'multi_brand_portal' => true,
                    'advanced_graphics' => true,
                    'monthly_design_consultation' => false,
                ]),
                'metadata' => [
                    'checkout_url' => null,
                    'annual_discount' => 'Save 15%',
                    'compares_to_monthly' => 1200,
                ],
            ],
            [
                'name' => 'Agency Yearly',
                'slug' => 'agency-yearly',
                'tagline' => 'Maximum creative scale, minimum billing friction.',
                'description' => 'Full access to premium support, advanced graphics, and account management with annual savings.',
                'price' => 1870,
                'interval' => 'yearly',
                'duration_days' => 365,
                'is_recommended' => false,
                'features' => $this->baseFeatures([
                    'turnaround_time' => '1 business day',
                    'priority_email_support' => true,
                    'slack_support' => true,
                    'dedicated_account_manager' => true,
                    'multi_brand_portal' => true,
                    'advanced_graphics' => true,
                    'monthly_design_consultation' => true,
                ]),
                'metadata' => [
                    'checkout_url' => null,
                    'annual_discount' => 'Save 15%',
                    'compares_to_monthly' => 2200,
                ],
            ],
        ];

        foreach ($plans as $index => $planData) {
            Plan::updateOrCreate(
                ['slug' => $planData['slug']],
                array_merge(
                    $planData,
                    [
                        'display_order' => $index + 1,
                        'is_active' => true,
                    ]
                )
            );
        }
    }

    protected function baseFeatures(array $overrides): array
    {
        $base = [
            'turnaround_time' => '4 business days',
            'number_of_designs' => 'Unlimited (one active task at a time)',
            'revisions_per_task' => 'Unlimited',
            'email_support' => true,
            'priority_email_support' => false,
            'slack_support' => false,
            'dedicated_account_manager' => false,
            'multi_brand_portal' => false,
            'advanced_graphics' => false,
            'design_templates' => true,
            'monthly_design_consultation' => false,
        ];

        return array_merge($base, $overrides);
    }
}
