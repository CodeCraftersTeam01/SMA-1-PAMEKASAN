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

    public function getAcademicCalendar()
    {
        $calendars = \Illuminate\Support\Facades\DB::table('academic_calendars')
            ->orderBy('event_date', 'asc')
            ->take(5)
            ->get();
        return response()->json([
            'success' => true,
            'data' => $calendars,
        ]);
    }

    public function getVirtualClassroom()
    {
        $classes = \Illuminate\Support\Facades\DB::table('virtual_classrooms')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();
        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    public function getForum()
    {
        $forums = \Illuminate\Support\Facades\DB::table('discussion_forums')
            ->orderBy('last_active', 'desc')
            ->take(5)
            ->get();
        return response()->json([
            'success' => true,
            'data' => $forums,
        ]);
    }

    public function getTeachers()
    {
        $teachers = \Illuminate\Support\Facades\DB::table('users')
            ->where('role', 'guru')
            ->select('id', 'name', 'photo', 'email')
            ->orderBy('name', 'asc')
            ->get();
        return response()->json([
            'success' => true,
            'data' => $teachers,
        ]);
    }
}
