<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Komentar;
use App\Models\Lokasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $komentars = Komentar::with([
            'user:id,name',
            'lokasi:id,nama_tempat,kategori_id,kecamatan_nama,desa_nama,kabupaten_nama,provinsi_nama',
            'lokasi.kategori:id,nama,warna',
        ])
            ->when($user->role === 'operator_desa', function ($q) use ($user) {
                $q->whereHas('lokasi', function ($sub) use ($user) {
                    if ($user->desa_id) {
                        $sub->where('desa_id', $user->desa_id);
                    } elseif ($user->kecamatan_id) {
                        $sub->where('kecamatan_id', $user->kecamatan_id);
                    }
                });
            })
            ->latest()
            ->take(50)
            ->get();

        $grouped = $komentars->groupBy('lokasi_id')->map(function ($items, $lokasiId) {
            $lokasi = $items->first()->lokasi;
            $wilayah = array_filter([
                $lokasi->desa_nama,
                $lokasi->kecamatan_nama,
                $lokasi->kabupaten_nama,
                $lokasi->provinsi_nama,
            ]);
            return [
                'lokasi_id' => $lokasiId,
                'nama_tempat' => $lokasi->nama_tempat,
                'kategori' => $lokasi->kategori ? [
                    'nama' => $lokasi->kategori->nama,
                    'warna' => $lokasi->kategori->warna,
                ] : null,
                'wilayah' => implode(', ', $wilayah),
                'total_komentar' => $items->count(),
                'komentars' => $items->map(function ($k) {
                    return [
                        'id' => $k->id,
                        'user' => $k->user ? $k->user->name : 'Anonymous',
                        'rating' => $k->rating,
                        'komentar' => $k->komentar,
                        'waktu' => $k->created_at->diffForHumans(),
                    ];
                })->values(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $grouped,
            'total' => $komentars->count(),
        ]);
    }
}
