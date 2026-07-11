<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use App\Models\Achievement;
use App\Models\Testimonial;
use App\Models\News;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LandingPageController extends Controller
{
    private function cached($data, int $seconds = 60)
    {
        return response()->json(['success' => true, 'data' => $data])
            ->header('Cache-Control', "public, max-age={$seconds}, stale-while-revalidate=60")
            ->header('Vary', 'Accept');
    }

    /**
     * GET /api/public/landing-data
     * Aggregates all landing page data into a single request to solve the single-threaded PHP built-in server bottleneck
     * and drastically improve Frontend LCP performance.
     */
    public function getLandingData()
    {
        // Settings & Stats
        $settings = \App\Models\LandingPageSetting::first() ?? new \App\Models\LandingPageSetting();
        $settings->total_kelas = \App\Models\Kelas::count();
        $settings->total_siswa = \App\Models\Siswa::where('is_active', 1)->count();
        $settings->total_alumni = \App\Models\Alumni::count();

        // Visitors
        $visitors = [
            'today' => \App\Models\WebsiteVisitor::whereDate('visited_date', date('Y-m-d'))->count(),
            'month' => \App\Models\WebsiteVisitor::whereYear('visited_date', date('Y'))->whereMonth('visited_date', date('m'))->count(),
            'year'  => \App\Models\WebsiteVisitor::whereYear('visited_date', date('Y'))->count(),
        ];

        // Random Quote
        $quote = \App\Models\TeacherQuote::inRandomOrder()->first();

        // Arrays
        $news = News::whereNotNull('published_at')
            ->select('id', 'title', 'content', 'category', 'image_url', 'published_at')
            ->orderBy('published_at', 'desc')->limit(6)->get();

        $achievements = Achievement::with(['siswas:id,nama_lengkap,kelas,jenis_kelamin,tahun_masuk'])
            ->where('status', 'approved')
            ->select('id', 'title', 'student_name', 'category', 'year', 'level', 'description', 'image_url')
            ->orderBy('year', 'desc')->limit(12)->get();

        $teachers = \App\Models\Teacher::select('id', 'name', 'subject', 'photo')
            ->orderBy('order', 'asc')->orderBy('name', 'asc')->get();

        $facilities = Facility::select('id', 'name', 'description', 'image_url', 'order')
            ->orderBy('order', 'asc')->get();

        $features = \App\Models\Feature::select('id', 'title', 'description', 'icon')
            ->orderBy('order', 'asc')->get();

        $programs = \App\Models\Program::select('id', 'title', 'description', 'features_json')
            ->orderBy('order', 'asc')->get();

        $agendas = \Illuminate\Support\Facades\DB::table('academic_calendars')
            ->select('id', 'title', 'type', 'event_date', 'description')
            ->where('event_date', '>=', \Carbon\Carbon::today()->toDateString())
            ->orderBy('event_date', 'asc')
            ->limit(6)
            ->get();

        $data = [
            'settings'     => $settings,
            'visitors'     => $visitors,
            'quote'        => $quote,
            'news'         => $news,
            'achievements' => $achievements,
            'teachers'     => $teachers,
            'facilities'   => $facilities,
            'features'     => $features,
            'programs'     => $programs,
            'agendas'      => $agendas,
        ];

        return $this->cached($data, 60);
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
            ->where('status', 'approved')
            ->select('id', 'title', 'student_name', 'category', 'year', 'level', 'description', 'image_url')
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
        return $this->cached($news, 60);
    }

    public function getNewsDetail($id)
    {
        $news = News::find($id);
        if (!$news) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return $this->cached($news, 60);
    }


    /**
     * GET /api/announcements/marquee or GET /api/public/announcements/marquee
     */
    public function getMarquee()
    {
        $marquee = \App\Models\Announcement::where('is_active', true)
            ->select('id', 'title', 'content', 'created_at as event_date')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return $this->cached($marquee, 60);
    }

    public function getAcademicCalendar()
    {
        $agendas = \Illuminate\Support\Facades\DB::table('academic_calendars')
            ->select('id', 'title', 'type', 'event_date', 'description')
            ->where('event_date', '>=', \Carbon\Carbon::today()->toDateString())
            ->orderBy('event_date', 'asc')
            ->limit(6)
            ->get();

        return $this->cached($agendas, 60);
    }

    public function getVirtualClassroom()
    {
        $classes = \Illuminate\Support\Facades\DB::table('virtual_classrooms')
            ->select('id', 'title', 'subject', 'teacher', 'thumbnail')
            ->orderBy('created_at', 'desc')
            ->limit(6)->get();
        return $this->cached($classes);
    }

    public function getAnnouncements()
    {
        $announcements = \App\Models\Announcement::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->limit(6)->get();
        return $this->cached($announcements);
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
        if (!$settings) {
            $settings = new \App\Models\LandingPageSetting();
        }
        
        $settings->total_kelas = \App\Models\Kelas::count();
        $settings->total_siswa = \App\Models\Siswa::where('is_active', 1)->count();
        $settings->total_alumni = \App\Models\Alumni::count();

        return $this->cached($settings, 60);
    }

    /**
     * POST /api/public/achievements/submit
     */
    public function storeAchievement(Request $request)
    {
        $this->validate($request, [
            'student_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:akademik,non-akademik,olahraga,seni',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'level' => 'required|string',
            'description' => 'required|string',
            'siswa_id' => 'nullable|integer|exists:siswas,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $data = $request->only([
            'student_name', 'title', 'category', 'year', 'level', 'description'
        ]);
        $data['status'] = 'pending';

        if ($request->hasFile('image')) {
            $path = \App\Helpers\ImageHelper::compressAndStore($request->file('image'), 'achievements');
            $data['image_url'] = $path;
        }

        $achievement = Achievement::create($data);

        if ($request->siswa_id) {
            $achievement->siswas()->sync([$request->siswa_id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Prestasi berhasil dikirim dan sedang menunggu verifikasi Admin. Terima kasih telah berpartisipasi!',
            'data' => $achievement->load('siswas:id,nama_lengkap,kelas,jenis_kelamin')
        ], 201);
    }

    /**
     * GET /api/public/siswa/lookup?nis=... or ?nisn=...
     */
    public function lookupSiswa(Request $request)
    {
        $nis = $request->query('nis');
        $nisn = $request->query('nisn');

        if (!$nis && !$nisn) {
            return response()->json([
                'success' => false,
                'message' => 'Masukkan NIS atau NISN'
            ], 400);
        }

        $query = Siswa::select('id', 'nis', 'nisn', 'nama_lengkap', 'kelas', 'jenis_kelamin', 'tahun_masuk')
            ->where('is_active', true);

        if ($nis) {
            $query->where('nis', $nis);
        } elseif ($nisn) {
            $query->where('nisn', $nisn);
        }

        $siswa = $query->first();

        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan. Periksa kembali NIS/NISN Anda.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $siswa
        ]);
    }
}
