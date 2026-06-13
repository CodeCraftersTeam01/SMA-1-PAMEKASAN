<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use App\Models\Achievement;
use App\Models\Testimonial;
use App\Models\News;

class LandingPageController extends Controller
{
    /**
     * GET /api/public/facilities
     * Mengembalikan daftar fasilitas sekolah, diurutkan berdasarkan 'order'.
     */
    public function getFacilities()
    {
        $facilities = Facility::orderBy('order', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $facilities,
        ]);
    }

    /**
     * GET /api/public/achievements
     * Mengembalikan daftar prestasi terbaru, diurutkan berdasarkan tahun.
     */
    public function getAchievements()
    {
        $achievements = Achievement::orderBy('year', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $achievements,
        ]);
    }

    /**
     * GET /api/public/testimonials
     * Mengembalikan daftar testimoni alumni/siswa.
     */
    public function getTestimonials()
    {
        $testimonials = Testimonial::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }

    /**
     * GET /api/public/news
     * Mengembalikan 3 berita terbaru yang sudah dipublikasikan.
     */
    public function getNews()
    {
        $news = News::whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();
        return response()->json([
            'success' => true,
            'data' => $news,
        ]);
    }
}
