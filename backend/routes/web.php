<?php

use App\Http\Controllers\Api\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Sistem Zonasi GIS API', 'version' => '1.0']);
});

Route::get('/sitemap.xml', [SitemapController::class, 'xml']);
