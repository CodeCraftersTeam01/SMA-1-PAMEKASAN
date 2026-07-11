<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\NisGeneratorService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            \App\Services\NisGeneratorService::class,
            \App\Services\NisGeneratorService::class
        );
    }

    /**
     * Boot cache invalidation events for public endpoints.
     */
    public function boot()
    {
        $cmsModels = [
            \App\Models\Facility::class,
            \App\Models\Achievement::class,
            \App\Models\Testimonial::class,
            \App\Models\News::class,
            \App\Models\Announcement::class,
            \App\Models\AcademicCalendar::class,
            \App\Models\Teacher::class,
            \App\Models\Feature::class,
            \App\Models\Program::class,
            \App\Models\LandingPageSetting::class,
            \App\Models\NavbarItem::class,
            \App\Models\Page::class,
            \App\Models\TeacherQuote::class,
            \App\Models\Extracurricular::class,
        ];

        $clearCache = function ($model) {
            \Illuminate\Support\Facades\Cache::forget('landing_page_data');
            \Illuminate\Support\Facades\Cache::forget('public_facilities');
            \Illuminate\Support\Facades\Cache::forget('public_achievements');
            \Illuminate\Support\Facades\Cache::forget('public_news');
            \Illuminate\Support\Facades\Cache::forget('public_marquee');
            \Illuminate\Support\Facades\Cache::forget('public_academic_calendar');
            \Illuminate\Support\Facades\Cache::forget('public_virtual_classroom');
            \Illuminate\Support\Facades\Cache::forget('public_announcements');
            \Illuminate\Support\Facades\Cache::forget('public_forum');
            \Illuminate\Support\Facades\Cache::forget('public_teachers');
            \Illuminate\Support\Facades\Cache::forget('public_features');
            \Illuminate\Support\Facades\Cache::forget('public_programs');
            \Illuminate\Support\Facades\Cache::forget('public_settings');
            \Illuminate\Support\Facades\Cache::forget('public_testimonials');
            \Illuminate\Support\Facades\Cache::forget('public_extracurriculars');

            if ($model instanceof \App\Models\News && isset($model->id)) {
                \Illuminate\Support\Facades\Cache::forget('public_news_detail_' . $model->id);
            }
        };

        foreach ($cmsModels as $modelClass) {
            if (class_exists($modelClass)) {
                $modelClass::saved($clearCache);
                $modelClass::deleted($clearCache);
            }
        }
    }
}
