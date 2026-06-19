<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Komentar;
use App\Models\Lokasi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KomentarController extends Controller
{
    public function index(Lokasi $lokasi): JsonResponse
    {
        $komentars = $lokasi->komentars()
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $komentars]);
    }

    public function store(Request $request, Lokasi $lokasi): JsonResponse
    {
        $validated = $request->validate([
            'rating'   => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string|max:1000',
        ]);

        $komentar = Komentar::create([
            'lokasi_id' => $lokasi->id,
            'user_id'   => $request->user()->id,
            'rating'    => $validated['rating'],
            'komentar'  => $validated['komentar'] ?? '',
        ]);

        $komentar->load('user:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Komentar berhasil ditambahkan',
            'data'    => $komentar,
        ], 201);
    }

    public function destroy(Request $request, Komentar $komentar): JsonResponse
    {
        if ($komentar->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak diizinkan'], 403);
        }

        $komentar->delete();

        return response()->json(['success' => true, 'message' => 'Komentar berhasil dihapus']);
    }
}
