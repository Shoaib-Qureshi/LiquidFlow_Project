<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandManagerAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the test manager user
        $manager = User::where('email', 'manager@test.com')->first();
        
        if ($manager) {
            // Get the first brand and assign the manager to it
            $brand = Brand::first();
            if ($brand) {
                // Assign manager to brand via brand_managers table
                $brand->managers()->syncWithoutDetaching([$manager->id]);
                $this->command->info("Assigned manager@test.com to brand: {$brand->name}");
            }
        }

        // Assign other managers to different brands
        $managers = User::role('Manager')->where('email', '!=', 'manager@test.com')->take(3)->get();
        $brands = Brand::skip(1)->take(3)->get();

        foreach ($managers as $index => $manager) {
            if (isset($brands[$index])) {
                $brands[$index]->managers()->syncWithoutDetaching([$manager->id]);
                $this->command->info("Assigned {$manager->email} to brand: {$brands[$index]->name}");
            }
        }

        $this->command->info('Brand-Manager assignments completed successfully!');
    }
}
