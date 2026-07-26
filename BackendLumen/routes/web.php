<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return response()->json([
        'message' => 'Welcome to SMA 1 Pamekasan API (Lumen)',
    ]);
});

// Auth Routes (rate limited to slow brute-force / flooding)
// NOTE: Public self-registration is disabled. Accounts are provisioned by an
// admin via POST /api/users (UserController@store). Re-enabling this route
// would let anyone on the internet create an authenticated account.
// $router->post('api/register', ['middleware' => 'throttle:10,60', 'uses' => 'AuthController@register']);
$router->post('api/login', ['middleware' => 'throttle:20,60', 'uses' => 'AuthController@login']);



// Serve uploaded files from the "public" disk via route (no storage:link needed)
$router->get('storage/{path:.*}', 'StorageController@show');

$router->post('api/public/alumni-tracking/verify', ['middleware' => 'throttle:20,60', 'uses' => 'PublicTrackingController@verify']);
$router->post('api/public/alumni-tracking/submit', ['middleware' => 'throttle:20,60', 'uses' => 'PublicTrackingController@submit']);
$router->get('api/public/alumni-tracking/status', ['middleware' => 'throttle:60,60', 'uses' => 'PublicTrackingController@status']);
$router->get('api/public/alumni-tracking/captcha', ['middleware' => 'throttle:60,60', 'uses' => 'PublicTrackingController@captcha']);

$router->get('api/test-mail', ['middleware' => ['throttle:3,60', 'api.key'], function() {
    $to = request('to', 'wardilanang46@gmail.com');
    try {
        \Illuminate\Support\Facades\Mail::raw('SMTP Mailer SMA 1 Pamekasan berhasil terhubung dan berfungsi dengan baik!', function ($message) use ($to) {
            $message->to($to)
                    ->subject('Test Koneksi SMTP SMAN 1 Pamekasan');
        });
        return response()->json([
            'status' => 'success',
            'message' => 'Koneksi SMTP berhasil! Email uji coba terkirim ke ' . $to
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gagal terhubung ke SMTP: ' . $e->getMessage()
        ], 500);
    }
}]);

// =====================================================
// PUBLIC Routes untuk Landing Page (Tanpa Auth)
// =====================================================
$router->group(['prefix' => 'api/public', 'middleware' => 'throttle:150,60'], function () use ($router) {
    // New aggregated endpoint for maximum performance (solves 8s LCP on single-thread php built-in server)
    $router->get('landing-data', 'LandingPageController@getLandingData');

    $router->get('facilities', 'LandingPageController@getFacilities');
    $router->get('achievements', 'LandingPageController@getAchievements');
    $router->post('achievements/submit', 'LandingPageController@storeAchievement');
    $router->get('siswa/lookup', 'LandingPageController@lookupSiswa');
    $router->get('testimonials', 'TestimonialController@getPublicTestimonials');
    $router->post('testimonials', ['middleware' => 'throttle:5,1', 'uses' => 'TestimonialController@submitPublicTestimonial']);
    $router->get('news', 'LandingPageController@getNews');
    $router->get('news/{id}', 'LandingPageController@getNewsDetail');
    $router->get('academic-calendar', 'LandingPageController@getAcademicCalendar');
    $router->get('announcements', 'LandingPageController@getAnnouncements');
    $router->get('announcements/marquee', 'LandingPageController@getMarquee');
    $router->get('virtual-classroom', 'LandingPageController@getVirtualClassroom');
    $router->get('forum', 'LandingPageController@getForum');
    $router->get('teachers', 'LandingPageController@getTeachers');
    $router->get('features', 'LandingPageController@getFeatures');
    $router->get('programs', 'LandingPageController@getPrograms');
    $router->get('extracurriculars', 'ExtracurricularController@index');
    $router->get('landing-settings', 'LandingPageController@getSettings');

    // Dynamic CMS Content
    $router->get('navbars', 'PublicContentController@getNavbars');
    $router->get('pages/{slug}', 'PublicContentController@getPage');
    $router->get('visitors', 'PublicContentController@getVisitors');
    $router->get('random-quote', 'TeacherQuoteController@getRandomQuote');
});

// Direct alias for RESTful URL standard outside the prefix group
$router->get('api/announcements/marquee', 'LandingPageController@getMarquee');

// API prefix group with Auth middleware
$router->group(['prefix' => 'api', 'middleware' => ['throttle:300,60', 'auth']], function () use ($router) {
    $router->post('logout', 'AuthController@logout');
    $router->get('user', 'AuthController@user');
    
    // Routes untuk Dashboard
    $router->get('dashboard', 'DashboardController@index');

    // --- Bulk Delete Endpoints ---
    $router->post('tahun-ajaran/bulk-delete', ['middleware' => 'permission:tahun_ajaran,delete', 'uses' => 'TahunAjaranController@bulkDelete']);
    $router->post('kelas/bulk-delete', ['middleware' => 'permission:kelas,delete', 'uses' => 'KelasController@bulkDelete']);
    $router->post('users/bulk-delete', ['middleware' => 'role:admin', 'uses' => 'UserController@bulkDelete']);
    $router->post('alumni/bulk-delete', ['middleware' => 'permission:alumni,delete', 'uses' => 'AlumniController@bulkDelete']);
    $router->post('admin/news/bulk-delete', ['middleware' => 'permission:berita,delete', 'uses' => 'AdminNewsController@bulkDelete']);
    $router->post('admin/achievements/bulk-delete', ['middleware' => 'permission:prestasi,delete', 'uses' => 'AdminAchievementController@bulkDelete']);
    $router->post('admin/facilities/bulk-delete', ['middleware' => 'permission:fasilitas,delete', 'uses' => 'AdminFacilityController@bulkDelete']);
    $router->post('admin/pages/bulk-delete', ['middleware' => 'permission:halaman,delete', 'uses' => 'AdminPageController@bulkDelete']);
    $router->post('admin/teachers/bulk-delete', ['middleware' => 'permission:teachers,delete', 'uses' => 'AdminTeacherController@bulkDelete']);
    $router->post('admin/features/bulk-delete', ['middleware' => 'permission:features,delete', 'uses' => 'AdminFeatureController@bulkDelete']);
    $router->post('admin/programs/bulk-delete', ['middleware' => 'permission:programs,delete', 'uses' => 'AdminProgramController@bulkDelete']);
    $router->post('admin/extracurriculars/bulk-delete', ['middleware' => 'permission:ekstrakurikuler,delete', 'uses' => 'ExtracurricularController@bulkDelete']);
    $router->post('admin/navbars/bulk-delete', ['middleware' => 'permission:navigasi,delete', 'uses' => 'AdminNavbarController@bulkDelete']);
    $router->post('teacher-quotes/bulk-delete', 'TeacherQuoteController@bulkDelete');
    $router->post('admin/agendas/bulk-delete', 'AcademicCalendarController@bulkDelete');
    $router->post('admin/announcements/bulk-delete', 'AnnouncementController@bulkDelete');
    // Routes untuk Profile
    $router->post('profile', 'ProfileController@updateProfile');
    $router->put('profile/password', 'ProfileController@updatePassword');
    $router->post('profile/setup', 'ProfileController@setupPassword');

    // Routes untuk Pendaftaran
    $router->post('pendaftaran/import', ['middleware' => 'permission:pendaftaran,create', 'uses' => 'PendaftaranController@import']);
    $router->post('pendaftaran/bulk-delete', ['middleware' => 'permission:pendaftaran,delete', 'uses' => 'PendaftaranController@bulkDelete']);
    $router->put('pendaftaran/bulk-update', ['middleware' => 'permission:pendaftaran,edit', 'uses' => 'PendaftaranController@bulkUpdate']);
    $router->put('pendaftaran/bulk-update-per-user', ['middleware' => 'permission:pendaftaran,edit', 'uses' => 'PendaftaranController@bulkUpdatePerUser']);
    $router->get('pendaftaran', ['middleware' => 'permission:pendaftaran,view', 'uses' => 'PendaftaranController@index']);
    $router->post('pendaftaran', ['middleware' => 'permission:pendaftaran,create', 'uses' => 'PendaftaranController@store']);
    $router->get('pendaftaran/{id}', ['middleware' => 'permission:pendaftaran,view', 'uses' => 'PendaftaranController@show']);
    $router->put('pendaftaran/{id}', ['middleware' => 'permission:pendaftaran,edit', 'uses' => 'PendaftaranController@update']);
    $router->delete('pendaftaran/{id}', ['middleware' => 'permission:pendaftaran,delete', 'uses' => 'PendaftaranController@destroy']);

    // Routes untuk Tahun Ajaran
    $router->get('tahun-ajaran', ['middleware' => 'permission:tahun_ajaran,view', 'uses' => 'TahunAjaranController@index']);
    $router->post('tahun-ajaran', ['middleware' => 'permission:tahun_ajaran,create', 'uses' => 'TahunAjaranController@store']);
    $router->get('tahun-ajaran/aktif', ['middleware' => 'permission:tahun_ajaran,view', 'uses' => 'TahunAjaranController@aktif']);
    $router->get('tahun-ajaran/{id}', ['middleware' => 'permission:tahun_ajaran,view', 'uses' => 'TahunAjaranController@show']);
    $router->put('tahun-ajaran/{id}', ['middleware' => 'permission:tahun_ajaran,edit', 'uses' => 'TahunAjaranController@update']);
    $router->delete('tahun-ajaran/{id}', ['middleware' => 'permission:tahun_ajaran,delete', 'uses' => 'TahunAjaranController@destroy']);

    // Routes untuk Kelas
    $router->get('kelas', ['middleware' => 'permission:kelas,view', 'uses' => 'KelasController@index']);
    $router->post('kelas', ['middleware' => 'permission:kelas,create', 'uses' => 'KelasController@store']);
    $router->get('kelas/{id}', ['middleware' => 'permission:kelas,view', 'uses' => 'KelasController@show']);
    $router->put('kelas/{id}', ['middleware' => 'permission:kelas,edit', 'uses' => 'KelasController@update']);
    $router->delete('kelas/{id}', ['middleware' => 'permission:kelas,delete', 'uses' => 'KelasController@destroy']);

    // Routes untuk Pengaturan NIS
    $router->get('pengaturan-nis', ['middleware' => 'permission:pengaturan,view', 'uses' => 'PengaturanNisController@index']);
    $router->put('pengaturan-nis', ['middleware' => 'permission:pengaturan,edit', 'uses' => 'PengaturanNisController@update']);
    $router->post('pengaturan-nis/preview', ['middleware' => 'permission:pengaturan,view', 'uses' => 'PengaturanNisController@preview']);

    // Routes untuk Pengaturan Tracking
    $router->get('pengaturan-tracking', ['middleware' => 'permission:pengaturan,view', 'uses' => 'PengaturanTrackingController@index']);
    $router->put('pengaturan-tracking', ['middleware' => 'permission:pengaturan,edit', 'uses' => 'PengaturanTrackingController@update']);

    // Routes untuk Siswa
    $router->post('siswa/migrate', ['middleware' => 'permission:siswa,create', 'uses' => 'SiswaController@migrate']);
    $router->post('siswa/bulk-delete', ['middleware' => 'permission:siswa,delete', 'uses' => 'SiswaController@bulkDelete']);
    $router->put('siswa/bulk-update', ['middleware' => 'permission:siswa,edit', 'uses' => 'SiswaController@bulkUpdate']);
    $router->put('siswa/bulk-update-per-user', ['middleware' => 'permission:siswa,edit', 'uses' => 'SiswaController@bulkUpdatePerUser']);
    $router->get('siswa', ['middleware' => 'permission:siswa,view', 'uses' => 'SiswaController@index']);
    $router->get('siswa/{id}', ['middleware' => 'permission:siswa,view', 'uses' => 'SiswaController@show']);
    $router->post('siswa', ['middleware' => 'permission:siswa,create', 'uses' => 'SiswaController@store']);
    $router->put('siswa/{id}', ['middleware' => 'permission:siswa,edit', 'uses' => 'SiswaController@update']);
    $router->delete('siswa/{id}', ['middleware' => 'permission:siswa,delete', 'uses' => 'SiswaController@destroy']);

    // Routes untuk Laporan
    $router->get('reports/pendaftaran', ['middleware' => 'permission:laporan,view', 'uses' => 'ReportController@pendaftaranReport']);
    $router->get('reports/siswa', ['middleware' => 'permission:laporan,view', 'uses' => 'ReportController@siswaReport']);

    // Routes untuk User Management (admin only)
    $router->get('users', ['middleware' => 'role:admin', 'uses' => 'UserController@index']);
    $router->get('users/{id}', ['middleware' => 'role:admin', 'uses' => 'UserController@show']);
    $router->post('users', ['middleware' => 'role:admin', 'uses' => 'UserController@store']);
    $router->put('users/{id}', ['middleware' => 'role:admin', 'uses' => 'UserController@update']);
    $router->delete('users/{id}', ['middleware' => 'role:admin', 'uses' => 'UserController@destroy']);

    // Routes untuk Hak Akses (Permissions) (admin only)
    $router->get('users/{id}/permissions', ['middleware' => 'role:admin', 'uses' => 'UserController@getPermissions']);
    $router->put('users/{id}/permissions', ['middleware' => 'role:admin', 'uses' => 'UserController@updatePermissions']);

    // Routes untuk Alumni Tracking Admin
    $router->get('alumni-tracking', ['middleware' => 'permission:alumni_tracking,view', 'uses' => 'AlumniTrackingController@index']);
    $router->post('student/tracking', ['middleware' => 'permission:alumni_tracking,create', 'uses' => 'AlumniTrackingController@store']);
    // $router->get('alumni', 'AlumniTrackingController@alumniList'); // Conflict with AlumniController

    // Routes untuk AI Import (Dynamic Excel)
    $router->post('ai-import/analyze', ['middleware' => 'permission:siswa,create', 'uses' => 'AiImportController@analyze']);
    $router->post('ai-import/execute', ['middleware' => 'permission:siswa,create', 'uses' => 'AiImportController@execute']);

    // Routes untuk Alumni Management
    $router->get('alumni', ['middleware' => 'permission:alumni,view', 'uses' => 'AlumniController@index']);
    $router->post('alumni', ['middleware' => 'permission:alumni,create', 'uses' => 'AlumniController@store']);

    // Routes untuk Website Content Management (CMS)
    $router->get('admin/news', ['middleware' => 'permission:berita,view', 'uses' => 'AdminNewsController@index']);
    $router->post('admin/news', ['middleware' => 'permission:berita,create', 'uses' => 'AdminNewsController@store']);
    $router->get('admin/news/{id}', ['middleware' => 'permission:berita,view', 'uses' => 'AdminNewsController@show']);
    $router->put('admin/news/{id}', ['middleware' => 'permission:berita,edit', 'uses' => 'AdminNewsController@update']);
    $router->delete('admin/news/{id}', ['middleware' => 'permission:berita,delete', 'uses' => 'AdminNewsController@destroy']);

    $router->get('admin/achievements', ['middleware' => 'permission:prestasi,view', 'uses' => 'AdminAchievementController@index']);
    $router->post('admin/achievements', ['middleware' => 'permission:prestasi,create', 'uses' => 'AdminAchievementController@store']);
    $router->get('admin/achievements/{id}', ['middleware' => 'permission:prestasi,view', 'uses' => 'AdminAchievementController@show']);
    $router->put('admin/achievements/{id}', ['middleware' => 'permission:prestasi,edit', 'uses' => 'AdminAchievementController@update']);
    $router->delete('admin/achievements/{id}', ['middleware' => 'permission:prestasi,delete', 'uses' => 'AdminAchievementController@destroy']);

    $router->get('admin/facilities', ['middleware' => 'permission:fasilitas,view', 'uses' => 'AdminFacilityController@index']);
    $router->post('admin/facilities', ['middleware' => 'permission:fasilitas,create', 'uses' => 'AdminFacilityController@store']);
    $router->get('admin/facilities/{id}', ['middleware' => 'permission:fasilitas,view', 'uses' => 'AdminFacilityController@show']);
    $router->put('admin/facilities/{id}', ['middleware' => 'permission:fasilitas,edit', 'uses' => 'AdminFacilityController@update']);
    $router->delete('admin/facilities/{id}', ['middleware' => 'permission:fasilitas,delete', 'uses' => 'AdminFacilityController@destroy']);

    $router->get('admin/pages', ['middleware' => 'permission:halaman,view', 'uses' => 'AdminPageController@index']);
    $router->post('admin/pages', ['middleware' => 'permission:halaman,create', 'uses' => 'AdminPageController@store']);
    $router->get('admin/pages/{id}', ['middleware' => 'permission:halaman,view', 'uses' => 'AdminPageController@show']);
    $router->put('admin/pages/{id}', ['middleware' => 'permission:halaman,edit', 'uses' => 'AdminPageController@update']);
    $router->delete('admin/pages/{id}', ['middleware' => 'permission:halaman,delete', 'uses' => 'AdminPageController@destroy']);

    $router->get('admin/teachers', ['middleware' => 'permission:teachers,view', 'uses' => 'AdminTeacherController@index']);
    $router->post('admin/teachers', ['middleware' => 'permission:teachers,create', 'uses' => 'AdminTeacherController@store']);
    $router->put('admin/teachers/bulk-update-per-user', ['middleware' => 'permission:teachers,edit', 'uses' => 'AdminTeacherController@bulkUpdatePerUser']);
    $router->get('admin/teachers/{id}', ['middleware' => 'permission:teachers,view', 'uses' => 'AdminTeacherController@show']);
    $router->post('admin/teachers/{id}', ['middleware' => 'permission:teachers,edit', 'uses' => 'AdminTeacherController@update']); // Use POST with _method=PUT for file upload
    $router->delete('admin/teachers/{id}', ['middleware' => 'permission:teachers,delete', 'uses' => 'AdminTeacherController@destroy']);

    $router->get('admin/features', ['middleware' => 'permission:features,view', 'uses' => 'AdminFeatureController@index']);
    $router->post('admin/features', ['middleware' => 'permission:features,create', 'uses' => 'AdminFeatureController@store']);
    $router->get('admin/features/{id}', ['middleware' => 'permission:features,view', 'uses' => 'AdminFeatureController@show']);
    $router->put('admin/features/{id}', ['middleware' => 'permission:features,edit', 'uses' => 'AdminFeatureController@update']);
    $router->delete('admin/features/{id}', ['middleware' => 'permission:features,delete', 'uses' => 'AdminFeatureController@destroy']);

    $router->get('admin/programs', ['middleware' => 'permission:programs,view', 'uses' => 'AdminProgramController@index']);
    $router->post('admin/programs', ['middleware' => 'permission:programs,create', 'uses' => 'AdminProgramController@store']);
    $router->get('admin/programs/{id}', ['middleware' => 'permission:programs,view', 'uses' => 'AdminProgramController@show']);
    $router->put('admin/programs/{id}', ['middleware' => 'permission:programs,edit', 'uses' => 'AdminProgramController@update']);
    $router->delete('admin/programs/{id}', ['middleware' => 'permission:programs,delete', 'uses' => 'AdminProgramController@destroy']);

    $router->get('admin/extracurriculars', ['middleware' => 'permission:ekstrakurikuler,view', 'uses' => 'ExtracurricularController@index']);
    $router->post('admin/extracurriculars', ['middleware' => 'permission:ekstrakurikuler,create', 'uses' => 'ExtracurricularController@store']);
    $router->get('admin/extracurriculars/{id}', ['middleware' => 'permission:ekstrakurikuler,view', 'uses' => 'ExtracurricularController@show']);
    $router->put('admin/extracurriculars/{id}', ['middleware' => 'permission:ekstrakurikuler,edit', 'uses' => 'ExtracurricularController@update']);
    $router->post('admin/extracurriculars/{id}', ['middleware' => 'permission:ekstrakurikuler,edit', 'uses' => 'ExtracurricularController@update']); // Spoofed PUT request for file upload support
    $router->delete('admin/extracurriculars/{id}', ['middleware' => 'permission:ekstrakurikuler,delete', 'uses' => 'ExtracurricularController@destroy']);

    // Landing Page Settings (Single Record) - admin only
    $router->get('admin/landing-page-settings', ['middleware' => 'role:admin', 'uses' => 'AdminLandingPageSettingController@index']);
    $router->post('admin/landing-page-settings', ['middleware' => 'role:admin', 'uses' => 'AdminLandingPageSettingController@update']); // Use POST to allow multipart/form-data upload
    $router->put('admin/landing-page-settings', ['middleware' => 'role:admin', 'uses' => 'AdminLandingPageSettingController@update']); // fallback

    $router->get('admin/navbars', ['middleware' => 'permission:navigasi,view', 'uses' => 'AdminNavbarController@index']);
    $router->post('admin/navbars', ['middleware' => 'permission:navigasi,create', 'uses' => 'AdminNavbarController@store']);
    $router->get('admin/navbars/{id}', ['middleware' => 'permission:navigasi,view', 'uses' => 'AdminNavbarController@show']);
    $router->put('admin/navbars/{id}', ['middleware' => 'permission:navigasi,edit', 'uses' => 'AdminNavbarController@update']);
    $router->delete('admin/navbars/{id}', ['middleware' => 'permission:navigasi,delete', 'uses' => 'AdminNavbarController@destroy']);

    $router->get('teacher-quotes', 'TeacherQuoteController@index');
    $router->post('teacher-quotes', 'TeacherQuoteController@store');
    $router->put('teacher-quotes/{id}', 'TeacherQuoteController@update');
    $router->delete('teacher-quotes/{id}', 'TeacherQuoteController@destroy');

    // ---------------------------------------------------
    // AGENDA (Academic Calendars)
    // ---------------------------------------------------
    $router->get('admin/agendas', 'AcademicCalendarController@index');
    $router->post('admin/agendas', 'AcademicCalendarController@store');
    $router->get('admin/agendas/{id}', 'AcademicCalendarController@show');
    $router->put('admin/agendas/{id}', 'AcademicCalendarController@update');
    $router->delete('admin/agendas/{id}', 'AcademicCalendarController@destroy');

    // ---------------------------------------------------
    // PENGUMUMAN (Announcements)
    // ---------------------------------------------------
    $router->get('admin/announcements', 'AnnouncementController@index');
    $router->post('admin/announcements', 'AnnouncementController@store');
    $router->get('admin/announcements/{id}', 'AnnouncementController@show');
    $router->put('admin/announcements/{id}', 'AnnouncementController@update');
    $router->delete('admin/announcements/{id}', 'AnnouncementController@destroy');

    // Admin Testimonials
    $router->get('admin/testimonials', ['middleware' => 'role:admin', 'uses' => 'TestimonialController@index']);
    $router->post('admin/testimonials', ['middleware' => 'role:admin', 'uses' => 'TestimonialController@store']);
    $router->post('admin/testimonials/bulk-delete', ['middleware' => 'role:admin', 'uses' => 'TestimonialController@bulkDelete']);
    $router->get('admin/testimonials/{id}', ['middleware' => 'role:admin', 'uses' => 'TestimonialController@show']);
    $router->put('admin/testimonials/{id}', ['middleware' => 'role:admin', 'uses' => 'TestimonialController@update']);
    $router->post('admin/testimonials/{id}', ['middleware' => 'role:admin', 'uses' => 'TestimonialController@update']); // Spoofed PUT
    $router->patch('admin/testimonials/{id}/status', ['middleware' => 'role:admin', 'uses' => 'TestimonialController@toggleStatus']);
    // Dashboard Notifications
    $router->get('admin/notifications', 'NotificationController@index');
    $router->get('admin/notifications/unread-count', 'NotificationController@unreadCount');
    $router->post('admin/notifications/read-all', 'NotificationController@readAll');
    $router->post('admin/notifications/{id}/read', 'NotificationController@read');
    $router->delete('admin/notifications/clear', 'NotificationController@clear');
});

//hello 