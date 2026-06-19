<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Lokasi;
use App\Models\Komentar;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $lokasiQuery = Lokasi::query();
        if ($user->isOperatorDesa()) {
            $lokasiQuery->where('desa_id', $user->desa_id);
        }

        $totalLokasi = (clone $lokasiQuery)->count();

        $statistikKategori = Kategori::withCount(['lokasis' => function ($q) use ($user) {
            if ($user->isOperatorDesa()) {
                $q->where('desa_id', $user->desa_id);
            }
        }])->get()->map(function ($k) {
            return [
                'id' => $k->id,
                'nama' => $k->nama,
                'warna' => $k->warna,
                'total' => $k->lokasis_count,
            ];
        });

        $statistikKecamatan = (clone $lokasiQuery)
            ->select('kecamatan_nama as nama', DB::raw('count(*) as total'))
            ->whereNotNull('kecamatan_nama')
            ->groupBy('kecamatan_nama')
            ->orderByDesc('total')
            ->get();

        $statistikKecamatanKategori = (clone $lokasiQuery)
            ->select('kecamatan_nama', 'kategori_id', DB::raw('count(*) as total'))
            ->whereNotNull('kecamatan_nama')
            ->groupBy('kecamatan_nama', 'kategori_id')
            ->orderBy('kecamatan_nama')
            ->get()
            ->groupBy('kecamatan_nama')
            ->map(function ($items, $nama) {
                $kategoriData = [];
                foreach ($items as $item) {
                    $kategori = \App\Models\Kategori::find($item->kategori_id);
                    $kategoriData[] = [
                        'kategori_id' => $item->kategori_id,
                        'kategori_nama' => $kategori?->nama ?? 'Unknown',
                        'warna' => $kategori?->warna ?? '#6B7280',
                        'total' => (int) $item->total,
                    ];
                }
                return [
                    'nama' => $nama,
                    'total' => $items->sum('total'),
                    'kategoris' => $kategoriData,
                ];
            })->values();

        $totalKomentar = Komentar::whereIn('lokasi_id', (clone $lokasiQuery)->pluck('id'))->count();
        $totalPengguna = User::where('role', 'user')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_kecamatan' => (clone $lokasiQuery)->distinct('kecamatan_id')->count('kecamatan_id'),
                'total_desa' => (clone $lokasiQuery)->distinct('desa_id')->count('desa_id'),
                'total_lokasi' => $totalLokasi,
                'total_kategori' => Kategori::count(),
                'total_komentar' => $totalKomentar,
                'total_pengguna' => $totalPengguna,
                'statistik_kategori' => $statistikKategori,
                'statistik_kecamatan' => $statistikKecamatan,
                'statistik_kecamatan_kategori' => $statistikKecamatanKategori,
            ],
        ]);
    }
}
