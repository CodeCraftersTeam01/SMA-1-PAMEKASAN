<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Core Settings & Master Data
        $this->call([
            PengaturanNisSeeder::class,
            PengaturanTrackingSeeder::class,
        ]);

        // 2. Default Users & Accounts
        \Illuminate\Support\Facades\DB::table('users')->insert([
            [
                'name' => 'Administrator',
                'email' => 'admin@sman1pamekasan.sch.id',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'admin',
                'created_at' => \Carbon\Carbon::now(),
                'updated_at' => \Carbon\Carbon::now(),
            ],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'admin',
                'created_at' => \Carbon\Carbon::now(),
                'updated_at' => \Carbon\Carbon::now(),
            ]
        ]);
        $this->call(StudentTestAccountSeeder::class);


        // 4. CMS & Landing Page Data
        $this->call([
            CmsSeeder::class,
            LandingPageSettingSeeder::class,
            LandingPageExtraSeeder::class,
            FacilitySeeder::class,
            AchievementSeeder::class,
            TestimonialSeeder::class,
            NewsSeeder::class,
            ExtracurricularSeeder::class,
            AnnouncementSeeder::class,
            WebsiteVisitorSeeder::class,
            NavbarItemSeeder::class,
            PageSeeder::class,
        ]);
    }
}
