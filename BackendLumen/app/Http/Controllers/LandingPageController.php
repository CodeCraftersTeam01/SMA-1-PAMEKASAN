<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use App\Models\Achievement;
use App\Models\Testimonial;
use App\Models\News;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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
        $data = Cache::remember('landing_page_data', 60, function () {
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

            $teachers = \App\Models\Teacher::select('id', 'name', 'subject', 'photo', 'jabatan')->get()
                ->sortBy(function($teacher) {
                    $jabatan = strtolower($teacher->jabatan ?? '');
                    if (str_contains($jabatan, 'kepala sekolah') && !str_contains($jabatan, 'wakil')) return 1;
                    if (str_contains($jabatan, 'wakil kepala') || str_contains($jabatan, 'wakasek')) return 2;
                    return 3;
                })->values();

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

            return [
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
        });

        return $this->cached($data, 60);
    }

    /**
     * GET /api/public/facilities
     */
    public function getFacilities()
    {
        $facilities = Cache::remember('public_facilities', 600, function () {
            return Facility::select('id', 'name', 'description', 'image_url', 'order')
                ->orderBy('order', 'asc')->get();
        });
        return $this->cached($facilities, 600);
    }

    /**
     * GET /api/public/achievements
     */
    public function getAchievements()
    {
        $achievements = Cache::remember('public_achievements', 60, function () {
            return Achievement::with(['siswas:id,nama_lengkap,kelas,jenis_kelamin,tahun_masuk'])
                ->where('status', 'approved')
                ->select('id', 'title', 'student_name', 'category', 'year', 'level', 'description', 'image_url')
                ->orderBy('year', 'desc')->limit(12)->get();
        });

        return $this->cached($achievements, 60);
    }

    /**
     * GET /api/public/testimonials
     */
    public function getTestimonials()
    {
        $testimonials = Cache::remember('public_testimonials_legacy', 60, function () {
            return Testimonial::select('id', 'name', 'content', 'role', 'photo')
                ->orderBy('created_at', 'desc')->limit(6)->get();
        });
        return $this->cached($testimonials, 60);
    }

    /**
     * GET /api/public/news
     */
    public function getNews()
    {
        $news = Cache::remember('public_news', 60, function () {
            return News::whereNotNull('published_at')
                ->select('id', 'title', 'content', 'category', 'image_url', 'published_at')
                ->orderBy('published_at', 'desc')
                ->limit(6)->get();
        });
        return $this->cached($news, 60);
    }

    public function getNewsDetail($id)
    {
        $news = Cache::remember('public_news_detail_' . $id, 60, function () use ($id) {
            return News::find($id);
        });
        if (!$news) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return $this->cached($news, 60);
    }

    /**
     * GET /api/announcements/marquee or GET /api/public/announcements/marquee
     */
    public function getMarquee()
    {
        $marquee = Cache::remember('public_marquee', 60, function () {
            return \App\Models\Announcement::where('is_active', true)
                ->select('id', 'title', 'content', 'created_at as event_date')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        });

        return $this->cached($marquee, 60);
    }

    public function getAcademicCalendar()
    {
        $agendas = Cache::remember('public_academic_calendar', 60, function () {
            return \Illuminate\Support\Facades\DB::table('academic_calendars')
                ->select('id', 'title', 'type', 'event_date', 'description')
                ->where('event_date', '>=', \Carbon\Carbon::today()->toDateString())
                ->orderBy('event_date', 'asc')
                ->limit(6)
                ->get();
        });

        return $this->cached($agendas, 60);
    }

    public function getVirtualClassroom()
    {
        $classes = Cache::remember('public_virtual_classroom', 60, function () {
            return \Illuminate\Support\Facades\DB::table('virtual_classrooms')
                ->select('id', 'title', 'subject', 'teacher', 'thumbnail')
                ->orderBy('created_at', 'desc')
                ->limit(6)->get();
        });
        return $this->cached($classes, 60);
    }

    public function getAnnouncements()
    {
        $announcements = Cache::remember('public_announcements', 60, function () {
            return \App\Models\Announcement::where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->limit(6)->get();
        });
        return $this->cached($announcements, 60);
    }

    public function getForum()
    {
        $forums = Cache::remember('public_forum', 60, function () {
            return \Illuminate\Support\Facades\DB::table('discussion_forums')
                ->select('id', 'title', 'category', 'replies', 'last_active')
                ->orderBy('last_active', 'desc')
                ->limit(5)->get();
        });
        return $this->cached($forums, 60);
    }

    public function getTeachers()
    {
        $teachers = Cache::remember('public_teachers', 600, function () {
            return \App\Models\Teacher::select('id', 'name', 'subject', 'photo', 'jabatan')->get()
                ->sortBy(function($teacher) {
                    $jabatan = strtolower($teacher->jabatan ?? '');
                    if (str_contains($jabatan, 'kepala sekolah') && !str_contains($jabatan, 'wakil')) return 1;
                    if (str_contains($jabatan, 'wakil kepala') || str_contains($jabatan, 'wakasek')) return 2;
                    return 3;
                })->values();
        });
        return $this->cached($teachers, 600);
    }

    public function getFeatures()
    {
        $features = Cache::remember('public_features', 600, function () {
            return \App\Models\Feature::select('id', 'title', 'description', 'icon')
                ->orderBy('order', 'asc')
                ->get();
        });
        return $this->cached($features, 600);
    }

    public function getPrograms()
    {
        $programs = Cache::remember('public_programs', 600, function () {
            return \App\Models\Program::select('id', 'title', 'description', 'features_json')
                ->orderBy('order', 'asc')
                ->get();
        });
        return $this->cached($programs, 600);
    }

    public function getSettings()
    {
        $settings = Cache::remember('public_settings', 60, function () {
            $settings = \App\Models\LandingPageSetting::first();
            if (!$settings) {
                $settings = new \App\Models\LandingPageSetting();
            }
            
            $settings->total_kelas = \App\Models\Kelas::count();
            $settings->total_siswa = \App\Models\Siswa::where('is_active', 1)->count();
            $settings->total_alumni = \App\Models\Alumni::count();
            
            return $settings;
        });

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

        try {
            \App\Models\DashboardNotification::create([
                'type' => 'prestasi',
                'title' => 'Pengajuan Prestasi Baru',
                'message' => "Pengajuan prestasi baru oleh {$achievement->student_name} dengan judul \"{$achievement->title}\".",
                'is_read' => false
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create notification: ' . $e->getMessage());
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
