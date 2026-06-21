<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\WilayahController;
use App\Http\Controllers\Api\KecamatanController;
use App\Http\Controllers\Api\DesaController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\LokasiController;
use App\Http\Controllers\Api\KomentarController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoutingController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-public', [AuthController::class, 'registerPublic']);

// Google OAuth
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Map data - public (no auth required for map viewing)
Route::get('/map/lokasi', [LokasiController::class, 'mapData']);

// Detail lokasi & komentar - public read
Route::get('/lokasi/{lokasi}', [LokasiController::class, 'show']);
Route::get('/lokasi/{lokasi}/komentar', [KomentarController::class, 'index']);

// Wilayah data - public read (from API Wilayah, not database)
Route::get('/wilayah/provinsi', [WilayahController::class, 'provinsi']);
Route::get('/wilayah/kabupaten', [WilayahController::class, 'kabupaten']);
Route::get('/wilayah/kecamatan', [WilayahController::class, 'kecamatan']);
Route::get('/wilayah/desa', [WilayahController::class, 'desa']);
Route::get('/wilayah/geocode', [WilayahController::class, 'geocode']);

// Routing (proxy ke OSRM)
Route::get('/routing', [RoutingController::class, 'route']);

// Kategori — public read
Route::get('/kategori', [KategoriController::class, 'index']);
Route::get('/kategori/{kategori}', [KategoriController::class, 'show']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifikasi
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);

    // Kecamatan (via API proxy)
    Route::get('/kecamatan', [KecamatanController::class, 'index']);
    Route::get('/kecamatan/{kecamatan}', [KecamatanController::class, 'show']);

    // Desa (via API proxy)
    Route::get('/desa', [DesaController::class, 'index']);
    Route::get('/desa/{desa}', [DesaController::class, 'show']);

    // Kategori — write only (read is public above)
    Route::post('/kategori', [KategoriController::class, 'store']);
    Route::put('/kategori/{kategori}', [KategoriController::class, 'update']);
    Route::delete('/kategori/{kategori}', [KategoriController::class, 'destroy']);

    // Deteksi lokasi (reverse geocode via Nominatim + API Wilayah)
    Route::post('/wilayah/lokasi-saya', [WilayahController::class, 'lokasiSaya']);

    // Lokasi
    Route::get('/lokasi', [LokasiController::class, 'index']);
    Route::post('/lokasi', [LokasiController::class, 'store']);
    Route::post('/lokasi/{lokasi}', [LokasiController::class, 'update']); // POST for multipart
    Route::delete('/lokasi/{lokasi}', [LokasiController::class, 'destroy']);
    Route::delete('/lokasi/foto/{foto}', [LokasiController::class, 'deleteFoto']);
    Route::post('/lokasi/radius-search', [LokasiController::class, 'radiusSearch']);

    // Komentar
    Route::post('/lokasi/{lokasi}/komentar', [KomentarController::class, 'store']);
    Route::delete('/komentar/{komentar}', [KomentarController::class, 'destroy']);

    // Settings
    Route::post('/settings/profile', [\App\Http\Controllers\Api\SettingsController::class, 'updateProfile']);
    Route::post('/settings/password', [\App\Http\Controllers\Api\SettingsController::class, 'updatePassword']);

    // Admin only
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
        Route::apiResource('users', UserController::class);
    });
});
