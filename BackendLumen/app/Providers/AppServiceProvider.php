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
}
