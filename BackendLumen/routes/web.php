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

// Auth Routes
$router->post('api/register', 'AuthController@register');
$router->post('api/login', 'AuthController@login');

$router->get('api/dashboard', 'DashboardController@index');

$router->post('api/public/alumni-tracking/verify', 'PublicTrackingController@verify');
$router->post('api/public/alumni-tracking/submit', 'PublicTrackingController@submit');
$router->get('api/public/alumni-tracking/status', 'PublicTrackingController@status');

$router->get('api/test-mail', function() {
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
});

// =====================================================
// PUBLIC Routes untuk Landing Page (Tanpa Auth)
// =====================================================
$router->group(['prefix' => 'api/public'], function () use ($router) {
    $router->get('facilities', 'LandingPageController@getFacilities');
    $router->get('achievements', 'LandingPageController@getAchievements');
    $router->get('testimonials', 'LandingPageController@getTestimonials');
    $router->get('news', 'LandingPageController@getNews');
});

// API prefix group with Auth middleware
$router->group(['prefix' => 'api', 'middleware' => 'auth'], function () use ($router) {
    $router->post('logout', 'AuthController@logout');
    $router->get('user', 'AuthController@user');

    // Routes untuk Profile
    $router->post('profile', 'ProfileController@updateProfile');
    $router->put('profile/password', 'ProfileController@updatePassword');
    $router->post('profile/setup', 'ProfileController@setupPassword');

    // Routes untuk Pendaftaran
    $router->post('pendaftaran/import', 'PendaftaranController@import');
    $router->post('pendaftaran/bulk-delete', 'PendaftaranController@bulkDelete');
    $router->put('pendaftaran/bulk-update', 'PendaftaranController@bulkUpdate');
    $router->put('pendaftaran/bulk-update-per-user', 'PendaftaranController@bulkUpdatePerUser');
    $router->get('pendaftaran', 'PendaftaranController@index');
    $router->post('pendaftaran', 'PendaftaranController@store');
    $router->get('pendaftaran/{id}', 'PendaftaranController@show');
    $router->put('pendaftaran/{id}', 'PendaftaranController@update');
    $router->delete('pendaftaran/{id}', 'PendaftaranController@destroy');

    // Routes untuk Tahun Ajaran
    $router->get('tahun-ajaran', 'TahunAjaranController@index');
    $router->post('tahun-ajaran', 'TahunAjaranController@store');
    $router->get('tahun-ajaran/aktif', 'TahunAjaranController@aktif');
    $router->get('tahun-ajaran/{id}', 'TahunAjaranController@show');
    $router->put('tahun-ajaran/{id}', 'TahunAjaranController@update');
    $router->delete('tahun-ajaran/{id}', 'TahunAjaranController@destroy');

    // Routes untuk Kelas
    $router->get('kelas', 'KelasController@index');
    $router->post('kelas', 'KelasController@store');
    $router->get('kelas/{id}', 'KelasController@show');
    $router->put('kelas/{id}', 'KelasController@update');
    $router->delete('kelas/{id}', 'KelasController@destroy');

    // Routes untuk Pengaturan NIS
    $router->get('pengaturan-nis', 'PengaturanNisController@index');
    $router->put('pengaturan-nis', 'PengaturanNisController@update');
    $router->post('pengaturan-nis/preview', 'PengaturanNisController@preview');

    // Routes untuk Pengaturan Tracking
    $router->get('pengaturan-tracking', 'PengaturanTrackingController@index');
    $router->put('pengaturan-tracking', 'PengaturanTrackingController@update');

    // Routes untuk Siswa
    $router->post('siswa/migrate', 'SiswaController@migrate');
    $router->post('siswa/bulk-delete', 'SiswaController@bulkDelete');
    $router->put('siswa/bulk-update', 'SiswaController@bulkUpdate');
    $router->put('siswa/bulk-update-per-user', 'SiswaController@bulkUpdatePerUser');
    $router->get('siswa', 'SiswaController@index');
    $router->get('siswa/{id}', 'SiswaController@show');
    $router->post('siswa', 'SiswaController@store');
    $router->put('siswa/{id}', 'SiswaController@update');
    $router->delete('siswa/{id}', 'SiswaController@destroy');

    // Routes untuk Laporan
    $router->get('reports/pendaftaran', 'ReportController@pendaftaranReport');
    $router->get('reports/siswa', 'ReportController@siswaReport');

    // Routes untuk User Management
    $router->get('users', 'UserController@index');
    $router->get('users/{id}', 'UserController@show');
    $router->post('users', 'UserController@store');
    $router->put('users/{id}', 'UserController@update');
    $router->delete('users/{id}', 'UserController@destroy');

    // Routes untuk Hak Akses (Permissions)
    $router->get('users/{id}/permissions', 'UserController@getPermissions');
    $router->put('users/{id}/permissions', 'UserController@updatePermissions');

    // Routes untuk Alumni Tracking Admin
    $router->get('alumni-tracking', 'AlumniTrackingController@index');
    $router->post('student/tracking', 'AlumniTrackingController@store');
    // $router->get('alumni', 'AlumniTrackingController@alumniList'); // Conflict with AlumniController

    // Routes untuk AI Import (Dynamic Excel)
    $router->post('ai-import/analyze', 'AiImportController@analyze');
    $router->post('ai-import/execute', 'AiImportController@execute');

    // Routes untuk Alumni Management
    $router->get('alumni', 'AlumniController@index');
    $router->post('alumni', 'AlumniController@store');
});

//hello 