<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class DesaController extends Controller
{
    private const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    public function index(Request $request): JsonResponse
    {
        $kecId = $request->kecamatan_id;
        if (!$kecId) {
            return response()->json(['success' => false, 'message' => 'Parameter kecamatan_id wajib diisi'], 400);
        }

        $response = Http::get(self::API_BASE . "/villages/{$kecId}.json");
        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data desa'], 502);
        }

        $data = collect($response->json())->map(fn($item) => [
            'id' => $item['id'],
            'kecamatan_id' => $kecId,
            'nama' => $item['name'],
        ])->values();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show(string $desa): JsonResponse
    {
        $kecId = substr($desa, 0, 6);
        $response = Http::get(self::API_BASE . "/villages/{$kecId}.json");
        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data desa'], 502);
        }

        $data = collect($response->json())->firstWhere('id', $desa);
        if (!$data) {
            return response()->json(['success' => false, 'message' => 'Desa tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $data['id'],
                'kecamatan_id' => $kecId,
                'nama' => $data['name'],
            ],
        ]);
    }
}
