<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users by role
        $managers = User::role('Manager')->get();
        $teamUsers = User::role('TeamUser')->get();

        // Create sample brands
        $brands = [
            [
                'name' => 'Tech Solutions Inc',
                'description' => 'Leading technology solutions provider',
                'status' => 'active',
            ],
            [
                'name' => 'Digital Marketing Pro',
                'description' => 'Professional digital marketing services',
                'status' => 'active',
            ],
            [
                'name' => 'Creative Design Studio',
                'description' => 'Creative design and branding agency',
                'status' => 'active',
            ],
            [
                'name' => 'E-commerce Plus',
                'description' => 'E-commerce development and consulting',
                'status' => 'inactive',
            ],
        ];

        foreach ($brands as $index => $brandData) {
            $brand = Brand::create($brandData);

            // Assign managers to brands (each manager gets 1-2 brands)
            if ($managers->count() > 0) {
                $managerIndex = $index % $managers->count();
                $brand->managers()->attach($managers[$managerIndex]->id);
            }

            // Assign team users to brands (each brand gets 1-2 team users)
            if ($teamUsers->count() > 0) {
                $teamUser1 = ($index * 2) % $teamUsers->count();
                $teamUser2 = ($index * 2 + 1) % $teamUsers->count();

                // Avoid duplicate assignments
                $assignments = [];
                if ($teamUser1 !== $teamUser2) {
                    $assignments[] = $teamUsers[$teamUser1]->id;
                }
                $assignments[] = $teamUsers[$teamUser2]->id;

                $brand->teamUsers()->attach($assignments);
            }
        }
    }
}
