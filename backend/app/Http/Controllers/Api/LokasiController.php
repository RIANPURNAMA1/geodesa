<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lokasi;
use App\Models\FotoLokasi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class LokasiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Lokasi::with(['kategori', 'fotos']);

        if ($user->isOperatorDesa()) {
            $query->where('desa_id', $user->desa_id);
        }

        if ($request->kecamatan_id) {
            $query->where('kecamatan_id', $request->kecamatan_id);
        }
        if ($request->desa_id) {
            $query->where('desa_id', $request->desa_id);
        }
        if ($request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_tempat', 'like', '%' . $request->search . '%')
                  ->orWhere('nama_pemilik', 'like', '%' . $request->search . '%')
                  ->orWhere('alamat', 'like', '%' . $request->search . '%');
            });
        }

        $data = $request->paginate === 'false'
            ? $query->orderBy('nama_tempat')->get()
            : $query->orderBy('nama_tempat')->paginate($request->per_page ?? 15);

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function mapData(Request $request): JsonResponse
    {
        $query = Lokasi::with(['kategori', 'fotos'])
            ->where('is_active', true);

        if ($request->provinsi_id) {
            $query->where('provinsi_id', $request->provinsi_id);
        }
        if ($request->kabupaten_id) {
            $query->where('kabupaten_id', $request->kabupaten_id);
        }
        if ($request->kecamatan_id) {
            $query->where('kecamatan_id', $request->kecamatan_id);
        }
        if ($request->desa_id) {
            $query->where('desa_id', $request->desa_id);
        }
        if ($request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }
        if ($request->nama) {
            $search = trim($request->nama);

            // Exact region match: if the search term matches a region name exactly,
            // include ALL locations in that region (not just text search hits)
            $query->where(function ($q) use ($search) {
                // Text search on name/address/description
                $q->where('nama_tempat', 'like', '%' . $search . '%')
                  ->orWhere('alamat', 'like', '%' . $search . '%')
                  ->orWhere('deskripsi', 'like', '%' . $search . '%');

                // Region name match — use exact match to find ALL locations in that region
                $q->orWhere('provinsi_nama', $search);
                $q->orWhere('kabupaten_nama', $search);
                $q->orWhere('kecamatan_nama', $search);
                $q->orWhere('desa_nama', $search);

                // Category match
                $q->orWhereHas('kategori', function ($q2) use ($search) {
                    $q2->where('nama', 'like', '%' . $search . '%');
                });

                // Also try uppercase match for region names (database stores uppercase)
                $upper = strtoupper($search);
                if ($upper !== $search) {
                    $q->orWhere('provinsi_nama', $upper);
                    $q->orWhere('kabupaten_nama', $upper);
                    $q->orWhere('kecamatan_nama', $upper);
                    $q->orWhere('desa_nama', $upper);
                }
            });
        }

        $lokasis = $query->orderBy('nama_tempat')->get();

        return response()->json(['success' => true, 'data' => $lokasis]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kecamatan_id'  => 'nullable|string|max:20',
            'desa_id'       => 'nullable|string|max:20',
            'kategori_id'   => 'required|exists:kategoris,id',
            'nama_tempat'   => 'required|string|max:255',
            'nama_pemilik'  => 'nullable|string|max:255',
            'nomor_telepon' => 'nullable|string|max:20',
            'alamat'        => 'required|string',
            'deskripsi'     => 'nullable|string',
            'latitude'      => 'required|numeric|between:-90,90',
            'longitude'     => 'required|numeric|between:-180,180',
            'is_active'     => 'boolean',
            'provinsi_id'   => 'nullable|string|max:10',
            'provinsi_nama' => 'nullable|string|max:255',
            'kabupaten_id'  => 'nullable|string|max:10',
            'kabupaten_nama'=> 'nullable|string|max:255',
            'kecamatan_nama'=> 'nullable|string|max:255',
            'desa_nama'     => 'nullable|string|max:255',
            'fotos'         => 'nullable|array',
            'fotos.*'       => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        DB::beginTransaction();
        try {
            $lokasi = Lokasi::create(array_merge($validated, [
                'user_id' => $request->user()->id,
            ]));

            if ($request->hasFile('fotos')) {
                foreach ($request->file('fotos') as $index => $foto) {
                    $path = $foto->store('lokasi/' . $lokasi->id, 'public');
                    FotoLokasi::create([
                        'lokasi_id' => $lokasi->id,
                        'path'      => $path,
                        'nama_file' => $foto->getClientOriginalName(),
                        'urutan'    => $index,
                    ]);
                }
            }

            DB::commit();
            $lokasi->load(['kategori', 'fotos']);

            return response()->json([
                'success' => true,
                'message' => 'Lokasi berhasil ditambahkan',
                'data'    => $lokasi,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Lokasi $lokasi): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $lokasi->load(['kategori', 'fotos', 'user']),
        ]);
    }

    public function update(Request $request, Lokasi $lokasi): JsonResponse
    {
        $user = $request->user();
        if ($user->isOperatorDesa() && $lokasi->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Tidak diizinkan'], 403);
        }

        $validated = $request->validate([
            'kecamatan_id'  => 'nullable|string|max:20',
            'desa_id'       => 'nullable|string|max:20',
            'kategori_id'   => 'required|exists:kategoris,id',
            'nama_tempat'   => 'required|string|max:255',
            'nama_pemilik'  => 'nullable|string|max:255',
            'nomor_telepon' => 'nullable|string|max:20',
            'alamat'        => 'required|string',
            'deskripsi'     => 'nullable|string',
            'latitude'      => 'required|numeric|between:-90,90',
            'longitude'     => 'required|numeric|between:-180,180',
            'is_active'     => 'boolean',
            'provinsi_id'   => 'nullable|string|max:10',
            'provinsi_nama' => 'nullable|string|max:255',
            'kabupaten_id'  => 'nullable|string|max:10',
            'kabupaten_nama'=> 'nullable|string|max:255',
            'kecamatan_nama'=> 'nullable|string|max:255',
            'desa_nama'     => 'nullable|string|max:255',
            'fotos'         => 'nullable|array',
            'fotos.*'       => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        DB::beginTransaction();
        try {
            $lokasi->update($validated);

            if ($request->hasFile('fotos')) {
                foreach ($request->file('fotos') as $index => $foto) {
                    $path = $foto->store('lokasi/' . $lokasi->id, 'public');
                    FotoLokasi::create([
                        'lokasi_id' => $lokasi->id,
                        'path'      => $path,
                        'nama_file' => $foto->getClientOriginalName(),
                        'urutan'    => $lokasi->fotos()->count() + $index,
                    ]);
                }
            }

            DB::commit();
            $lokasi->load(['kategori', 'fotos']);

            return response()->json([
                'success' => true,
                'message' => 'Lokasi berhasil diperbarui',
                'data'    => $lokasi,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Lokasi $lokasi): JsonResponse
    {
        $user = $request->user();
        if ($user->isOperatorDesa() && $lokasi->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Tidak diizinkan'], 403);
        }

        foreach ($lokasi->fotos as $foto) {
            Storage::disk('public')->delete($foto->path);
        }

        $lokasi->delete();

        return response()->json(['success' => true, 'message' => 'Lokasi berhasil dihapus']);
    }

    public function deleteFoto(Request $request, FotoLokasi $foto): JsonResponse
    {
        $user = $request->user();
        $lokasi = $foto->lokasi;

        if ($user->isOperatorDesa() && $lokasi->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Tidak diizinkan'], 403);
        }

        Storage::disk('public')->delete($foto->path);
        $foto->delete();

        return response()->json(['success' => true, 'message' => 'Foto berhasil dihapus']);
    }

    public function radiusSearch(Request $request): JsonResponse
    {
        $request->validate([
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius'    => 'required|numeric|min:0.1|max:100',
        ]);

        $lat    = $request->latitude;
        $lng    = $request->longitude;
        $radius = $request->radius;

        $lokasis = Lokasi::with(['kategori', 'fotos'])
            ->where('is_active', true)
            ->selectRaw("*, (
                6371 * acos(
                    cos(radians(?)) * cos(radians(latitude))
                    * cos(radians(longitude) - radians(?))
                    + sin(radians(?)) * sin(radians(latitude))
                )
            ) AS distance", [$lat, $lng, $lat])
            ->having('distance', '<=', $radius)
            ->orderBy('distance')
            ->get();

        return response()->json(['success' => true, 'data' => $lokasis]);
    }
}
