<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PendaftaranController;

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

    // Routes untuk Pendaftaran
    Route::apiResource('pendaftaran', PendaftaranController::class);
});
