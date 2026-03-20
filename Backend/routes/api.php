<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PendaftaranController;

use App\Http\Controllers\TahunAjaranController;

Route::post('/register', [AuthController::class , 'register']);
Route::post('/login', [AuthController::class , 'login']);
Route::get('/', function () {
    return response()->json([
    'message' => 'Welcome to SMA 1 Pamekasan API',
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Routes untuk Profile
    Route::post('/profile', [\App\Http\Controllers\ProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword']);


    // Routes untuk Pendaftaran
    Route::post('pendaftaran/import', [PendaftaranController::class, 'import']);
    Route::apiResource('pendaftaran', PendaftaranController::class);
    
    // Routes untuk Tahun Ajaran
    Route::apiResource('tahun-ajaran', TahunAjaranController::class);
});
