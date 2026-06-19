<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class KecamatanController extends Controller
{
    private const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    public function index(Request $request): JsonResponse
    {
        $kabId = $request->kabupaten_id;
        if (!$kabId) {
            return response()->json(['success' => false, 'message' => 'Parameter kabupaten_id wajib diisi'], 400);
        }

        $response = Http::get(self::API_BASE . "/districts/{$kabId}.json");
        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data kecamatan'], 502);
        }

        $data = collect($response->json())->map(fn($item) => [
            'id' => $item['id'],
            'kabupaten_id' => $kabId,
            'nama' => $item['name'],
        ])->values();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show(string $kecamatan): JsonResponse
    {
        // Show requires kecamatan ID (kode) - we can't fetch a single kecamatan from API
        // Return basic info based on the ID
        $kabId = substr($kecamatan, 0, 4);
        $response = Http::get(self::API_BASE . "/districts/{$kabId}.json");
        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data kecamatan'], 502);
        }

        $data = collect($response->json())->firstWhere('id', $kecamatan);
        if (!$data) {
            return response()->json(['success' => false, 'message' => 'Kecamatan tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $data['id'],
                'kabupaten_id' => $kabId,
                'nama' => $data['name'],
            ],
        ]);
    }
}
