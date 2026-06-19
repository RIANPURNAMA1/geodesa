<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lokasi;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function xml(): Response
    {
        $lokasis = Lokasi::select('id', 'nama_tempat', 'updated_at')
            ->orderBy('id')
            ->get();

        $baseUrl = config('app.url', 'https://zonasi-gis.example.com');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        $xml .= '<url>';
        $xml .= "<loc>{$baseUrl}</loc>";
        $xml .= '<changefreq>daily</changefreq>';
        $xml .= '<priority>1.0</priority>';
        $xml .= '</url>';

        $xml .= '<url>';
        $xml .= "<loc>{$baseUrl}/login</loc>";
        $xml .= '<changefreq>monthly</changefreq>';
        $xml .= '<priority>0.3</priority>';
        $xml .= '</url>';

        foreach ($lokasis as $lokasi) {
            $xml .= '<url>';
            $xml .= "<loc>{$baseUrl}/lokasi/{$lokasi->id}</loc>";
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.8</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
