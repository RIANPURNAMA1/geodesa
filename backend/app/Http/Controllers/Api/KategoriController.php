<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KategoriController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Kategori::withCount('lokasis');

        if ($request->search) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        $data = $request->paginate === 'false'
            ? $query->get()
            : $query->paginate($request->per_page ?? 15);

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'ikon' => 'nullable|string|max:50',
            'warna' => 'nullable|string|max:10',
            'deskripsi' => 'nullable|string',
        ]);

        $kategori = Kategori::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan',
            'data' => $kategori,
        ], 201);
    }

    public function show(Kategori $kategori): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $kategori->loadCount('lokasis'),
        ]);
    }

    public function update(Request $request, Kategori $kategori): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'ikon' => 'nullable|string|max:50',
            'warna' => 'nullable|string|max:10',
            'deskripsi' => 'nullable|string',
        ]);

        $kategori->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => $kategori,
        ]);
    }

    public function destroy(Kategori $kategori): JsonResponse
    {
        if ($kategori->lokasis()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori masih digunakan oleh lokasi',
            ], 422);
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
