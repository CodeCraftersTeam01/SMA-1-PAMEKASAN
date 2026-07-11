<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WebsiteVisitor;
use Carbon\Carbon;
use Faker\Factory as Faker;

class WebsiteVisitorSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $startDate = Carbon::now()->subDays(30);

        for ($i = 0; $i < 30; $i++) {
            $date = $startDate->copy()->addDays($i)->toDateString();
            
            // Seed 10-50 visitors per day
            $dailyVisitors = rand(10, 50);
            
            for ($j = 0; $j < $dailyVisitors; $j++) {
                WebsiteVisitor::create([
                    'ip_address' => $faker->ipv4(),
                    'user_agent' => $faker->userAgent(),
                    'visited_date' => $date,
                ]);
            }
        }
    }
}
