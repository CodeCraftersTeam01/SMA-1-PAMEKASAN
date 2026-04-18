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

// API prefix group with Auth middleware
$router->group(['prefix' => 'api', 'middleware' => 'auth'], function () use ($router) {
    $router->post('logout', 'AuthController@logout');
    $router->get('user', 'AuthController@user');

    // Routes untuk Profile
    $router->post('profile', 'ProfileController@updateProfile');
    $router->put('profile/password', 'ProfileController@updatePassword');

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
});
