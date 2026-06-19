<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class RoutingController extends Controller
{
    public function route(Request $request): JsonResponse
    {
        $request->validate([
            'from_lat' => 'required|numeric',
            'from_lng' => 'required|numeric',
            'to_lat' => 'required|numeric',
            'to_lng' => 'required|numeric',
        ]);

        $fromLng = $request->from_lng;
        $fromLat = $request->from_lat;
        $toLng = $request->to_lng;
        $toLat = $request->to_lat;

        try {
            $response = Http::timeout(10)->get(
                "https://router.project-osrm.org/route/v1/driving/{$fromLng},{$fromLat};{$toLng},{$toLat}",
                ['geometries' => 'geojson', 'overview' => 'full']
            );

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil rute dari OSRM',
                ], 502);
            }

            $data = $response->json();

            if (empty($data['routes'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rute tidak ditemukan',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal terhubung ke server routing',
            ], 502);
        }
    }
}
