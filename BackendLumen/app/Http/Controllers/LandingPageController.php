<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use App\Models\Achievement;
use App\Models\Testimonial;
use App\Models\News;

class LandingPageController extends Controller
{
    private function cached($data, int $seconds = 300)
    {
        return response()->json(['success' => true, 'data' => $data])
            ->header('Cache-Control', "public, max-age={$seconds}, stale-while-revalidate=60")
            ->header('Vary', 'Accept');
    }

    /**
     * GET /api/public/facilities
     */
    public function getFacilities()
    {
        $facilities = Facility::select('id', 'name', 'description', 'image_url', 'order')
            ->orderBy('order', 'asc')->get();
        return $this->cached($facilities);
    }

    /**
     * GET /api/public/achievements
     */
    public function getAchievements()
    {
        $achievements = Achievement::with(['siswas:id,nama_lengkap,kelas,jenis_kelamin,tahun_masuk'])
            ->select('id', 'title', 'student_name', 'category', 'year', 'level', 'description')
            ->orderBy('year', 'desc')->limit(12)->get();

        return $this->cached($achievements);
    }

    /**
     * GET /api/public/testimonials
     */
    public function getTestimonials()
    {
        $testimonials = Testimonial::select('id', 'name', 'content', 'role', 'photo')
            ->orderBy('created_at', 'desc')->limit(6)->get();
        return $this->cached($testimonials);
    }

    /**
     * GET /api/public/news
     */
    public function getNews()
    {
        $news = News::whereNotNull('published_at')
            ->select('id', 'title', 'content', 'category', 'image_url', 'published_at')
            ->orderBy('published_at', 'desc')
            ->limit(6)->get();
        return $this->cached($news);
    }

    public function getNewsDetail($id)
    {
        $news = News::find($id);
        if (!$news) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return $this->cached($news);
    }

    public function getAcademicCalendar()
    {
        $calendars = \Illuminate\Support\Facades\DB::table('academic_calendars')
            ->select('id', 'title', 'event_date', 'type')
            ->orderBy('event_date', 'asc')
            ->limit(5)->get();
        return $this->cached($calendars);
    }

    public function getVirtualClassroom()
    {
        $classes = \Illuminate\Support\Facades\DB::table('virtual_classrooms')
            ->select('id', 'title', 'subject', 'teacher', 'thumbnail')
            ->orderBy('created_at', 'desc')
            ->limit(6)->get();
        return $this->cached($classes);
    }

    public function getForum()
    {
        $forums = \Illuminate\Support\Facades\DB::table('discussion_forums')
            ->select('id', 'title', 'category', 'replies', 'last_active')
            ->orderBy('last_active', 'desc')
            ->limit(5)->get();
        return $this->cached($forums);
    }

    public function getTeachers()
    {
        $teachers = \App\Models\Teacher::select('id', 'name', 'subject', 'photo')
            ->orderBy('order', 'asc')
            ->orderBy('name', 'asc')
            ->get();
        return $this->cached($teachers, 600);
    }

    public function getFeatures()
    {
        $features = \App\Models\Feature::select('id', 'title', 'description', 'icon')
            ->orderBy('order', 'asc')
            ->get();
        return $this->cached($features, 600);
    }

    public function getPrograms()
    {
        $programs = \App\Models\Program::select('id', 'title', 'description', 'features_json')
            ->orderBy('order', 'asc')
            ->get();
        return $this->cached($programs, 600);
    }

    public function getSettings()
    {
        $settings = \App\Models\LandingPageSetting::first();
        return $this->cached($settings, 600);
    }
}
