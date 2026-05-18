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
$router->post('api/login-siswa', 'StudentAuthController@loginSiswa');

// API prefix group with Auth middleware
$router->group(['prefix' => 'api', 'middleware' => 'auth'], function () use ($router) {
    $router->post('logout', 'AuthController@logout');
    $router->get('user', 'AuthController@user');

    // Route untuk Dashboard
    $router->get('dashboard', 'DashboardController@index');

    // Routes untuk Profile
    $router->post('profile', 'ProfileController@updateProfile');
    $router->put('profile/password', 'ProfileController@updatePassword');
    $router->post('profile/setup', 'ProfileController@setupPassword');

    // Routes untuk Pendaftaran
    $router->post('pendaftaran/import', 'PendaftaranController@import');
    $router->get('pendaftaran', 'PendaftaranController@index');
    $router->post('pendaftaran', 'PendaftaranController@store');
    $router->get('pendaftaran/{id}', 'PendaftaranController@show');
    $router->put('pendaftaran/{id}', 'PendaftaranController@update');
    $router->delete('pendaftaran/{id}', 'PendaftaranController@destroy');

    // Routes untuk Tahun Ajaran
    $router->get('tahun-ajaran', 'TahunAjaranController@index');
    $router->post('tahun-ajaran', 'TahunAjaranController@store');
    $router->get('tahun-ajaran/{id}', 'TahunAjaranController@show');
    $router->put('tahun-ajaran/{id}', 'TahunAjaranController@update');
    $router->delete('tahun-ajaran/{id}', 'TahunAjaranController@destroy');

    // Routes untuk Pengaturan NIS
    $router->get('pengaturan-nis', 'PengaturanNisController@index');
    $router->put('pengaturan-nis', 'PengaturanNisController@update');
    $router->post('pengaturan-nis/preview', 'PengaturanNisController@preview');

    // Routes untuk Pengaturan Tracking
    $router->get('pengaturan-tracking', 'PengaturanTrackingController@index');
    $router->put('pengaturan-tracking', 'PengaturanTrackingController@update');

    // Routes untuk Siswa
    $router->post('siswa/migrate', 'SiswaController@migrate');
    $router->get('siswa', 'SiswaController@index');
    $router->get('siswa/{id}', 'SiswaController@show');
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

    // Routes untuk Penelusuran Alumni (Siswa)
    $router->post('student/tracking', 'TrackingController@store');
});

//hello 