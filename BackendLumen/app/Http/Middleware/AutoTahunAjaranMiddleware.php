<?php

namespace App\Http\Middleware;

use Closure;
use Carbon\Carbon;
use App\Models\TahunAjaran;

class AutoTahunAjaranMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        try {
            $now = Carbon::now();
            $year = $now->year;
            $month = $now->month;

            // In Indonesia, the new academic year starts in July (month >= 7)
            if ($month >= 7) {
                $expectedTahun = $year . '/' . ($year + 1);
            } else {
                $expectedTahun = ($year - 1) . '/' . $year;
            }

            // Check if this academic year exists in database
            $exists = TahunAjaran::where('tahun', $expectedTahun)->first();

            if (!$exists) {
                // Deactivate all previous academic years
                TahunAjaran::where('is_active', true)->update(['is_active' => false]);

                // Create and activate the new academic year
                TahunAjaran::create([
                    'tahun' => $expectedTahun,
                    'is_active' => true
                ]);
            } else {
                // Ensure at least one year is marked active (fallback if all are inactive)
                $activeExists = TahunAjaran::where('is_active', true)->exists();
                if (!$activeExists) {
                    $exists->update(['is_active' => true]);
                }
            }
        } catch (\Exception $e) {
            // Silently ignore database exceptions to avoid blocking initial migrations or seeds
        }

        return $next($request);
    }
}
