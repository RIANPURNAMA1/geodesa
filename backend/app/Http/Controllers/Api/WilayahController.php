<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WilayahController extends Controller
{
    private const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    public function provinsi(): JsonResponse
    {
        $response = Http::get(self::API_BASE . '/provinces.json');
        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data provinsi'], 502);
        }
        $data = collect($response->json())->map(fn($item) => [
            'id' => $item['id'],
            'nama' => $item['name'],
        ])->values();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function kabupaten(Request $request): JsonResponse
    {
        $provId = $request->provinsi_id;
        if (!$provId) {
            return response()->json(['success' => false, 'message' => 'Parameter provinsi_id wajib diisi'], 400);
        }
        $response = Http::get(self::API_BASE . "/regencies/{$provId}.json");
        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data kabupaten'], 502);
        }
        $data = collect($response->json())->map(fn($item) => [
            'id' => $item['id'],
            'provinsi_id' => $provId,
            'nama' => $item['name'],
        ])->values();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function kecamatan(Request $request): JsonResponse
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

    public function desa(Request $request): JsonResponse
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

    public function lokasiSaya(Request $request): JsonResponse
    {
        $request->validate([
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $response = Http::withHeaders([
            'User-Agent' => 'ZonasiGISApp/1.0',
        ])->get('https://nominatim.openstreetmap.org/reverse', [
            'format'         => 'json',
            'lat'            => $request->latitude,
            'lon'            => $request->longitude,
            'addressdetails' => 1,
            'zoom'           => 18,
        ]);

        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Gagal reverse geocode'], 502);
        }

        $body = $response->json();
        $addr = $body['address'] ?? [];

        $provinsiNama  = $addr['state'] ?? null;
        $kabupatenNama = $addr['county'] ?? $addr['city'] ?? $addr['state_district'] ?? null;
        $kecamatanNama = $addr['district'] ?? $addr['county_subdivision'] ?? null;
        $desaNama      = $addr['village'] ?? $addr['hamlet'] ?? $addr['neighbourhood'] ?? $addr['city_district'] ?? null;

        $cari = function ($list, $name) {
            if (!$name) return null;
            $upper = strtoupper(trim($name));
            foreach ($list as $item) {
                if (strtoupper(trim($item['nama'])) === $upper) return $item;
            }
            foreach ($list as $item) {
                $prefixes = ['KABUPATEN ', 'KOTA ', 'KECAMATAN ', 'DESA ', 'KELURAHAN '];
                $clean = $upper;
                foreach ($prefixes as $p) {
                    if (str_starts_with($upper, $p)) {
                        $clean = trim(substr($upper, strlen($p)));
                        break;
                    }
                }
                if (str_contains(strtoupper($item['nama']), $clean)) return $item;
                if (str_contains($clean, strtoupper($item['nama']))) return $item;
            }
            return null;
        };

        $provinsi = null;
        $kabupaten = null;
        $kecamatan = null;
        $desa = null;

        if ($provinsiNama) {
            $allProv = Http::get(self::API_BASE . '/provinces.json')->json();
            $provinsi = $cari(array_map(fn($p) => ['id' => $p['id'], 'nama' => $p['name']], $allProv), $provinsiNama);
        }

        if ($kabupatenNama && $provinsi) {
            $allKab = Http::get(self::API_BASE . "/regencies/{$provinsi['id']}.json")->json();
            $kabupaten = $cari(array_map(fn($k) => ['id' => $k['id'], 'nama' => $k['name']], $allKab), $kabupatenNama);
        }

        if ($kecamatanNama && $kabupaten) {
            $allKec = Http::get(self::API_BASE . "/districts/{$kabupaten['id']}.json")->json();
            $kecamatan = $cari(array_map(fn($k) => ['id' => $k['id'], 'nama' => $k['name']], $allKec), $kecamatanNama);
        }

        if ($desaNama && $kecamatan) {
            $allDesa = Http::get(self::API_BASE . "/villages/{$kecamatan['id']}.json")->json();
            $desa = $cari(array_map(fn($d) => ['id' => $d['id'], 'nama' => $d['name']], $allDesa), $desaNama);
        }

        // Infer missing dari yang sudah ditemukan
        if ($desa && !$kecamatan) {
            $kecamatanId = substr($desa['id'], 0, 6);
            $allKec = $kabupaten ? Http::get(self::API_BASE . "/districts/{$kabupaten['id']}.json")->json() : [];
            foreach ($allKec as $k) {
                if ($k['id'] === $kecamatanId) {
                    $kecamatan = ['id' => $k['id'], 'nama' => $k['name']];
                    break;
                }
            }
        }
        if ($kecamatan && !$kabupaten) {
            $kabupatenId = substr($kecamatan['id'], 0, 4);
            $allKab = $provinsi ? Http::get(self::API_BASE . "/regencies/{$provinsi['id']}.json")->json() : [];
            foreach ($allKab as $k) {
                if ($k['id'] === $kabupatenId) {
                    $kabupaten = ['id' => $k['id'], 'nama' => $k['name']];
                    break;
                }
            }
        }
        if ($kabupaten && !$provinsi) {
            $provinsiId = substr($kabupaten['id'], 0, 2);
            $allProv = Http::get(self::API_BASE . '/provinces.json')->json();
            foreach ($allProv as $p) {
                if ($p['id'] === $provinsiId) {
                    $provinsi = ['id' => $p['id'], 'nama' => $p['name']];
                    break;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'provinsi'  => $provinsi,
                'kabupaten' => $kabupaten,
                'kecamatan' => $kecamatan,
                'desa'      => $desa,
                'alamat'    => $body['display_name'] ?? null,
                'latitude'  => $request->latitude,
                'longitude' => $request->longitude,
            ],
        ]);
    }

    public function geocode(Request $request): JsonResponse
    {
        $request->validate([
            'provinsi'  => 'nullable|string|max:100',
            'kabupaten' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'desa'      => 'nullable|string|max:100',
        ]);

        // Build search query: simpler queries work better with Nominatim
        $parts = [];
        if ($request->desa && $request->kabupaten) {
            // For desa, skip kecamatan — desa + kabupaten alone is more reliable
            $parts[] = $this->cleanName($request->desa);
            $parts[] = $this->cleanName($request->kabupaten);
        } elseif ($request->kecamatan) {
            $parts[] = $this->cleanName($request->kecamatan);
            if ($request->kabupaten) $parts[] = $this->cleanName($request->kabupaten);
            if ($request->provinsi) $parts[] = $this->cleanName($request->provinsi);
        } elseif ($request->kabupaten) {
            $parts[] = $this->cleanName($request->kabupaten);
            if ($request->provinsi) $parts[] = $this->cleanName($request->provinsi);
        } elseif ($request->provinsi) {
            $parts[] = $this->cleanName($request->provinsi);
        }
        $parts[] = 'Indonesia';
        $q = implode(', ', $parts);

        $cacheKey = 'geo_' . md5($q);

        $data = Cache::remember($cacheKey, 86400, function () use ($q, $parts, $request) {
            sleep(1);

            // Queries to try in order
            $queries = [$q];
            if ($request->desa && $request->kabupaten && $request->kecamatan) {
                $alt = $this->cleanName($request->desa) . ', ' . $this->cleanName($request->kecamatan)
                     . ', ' . $this->cleanName($request->kabupaten) . ', ' . $this->cleanName($request->provinsi ?? '');
                if ($alt !== $q) $queries[] = $alt;
            }

            foreach ($queries as $tryQ) {
                $resp = Http::withHeaders(['User-Agent' => 'ZonasiGISApp/1.0', 'Accept-Encoding' => 'gzip'])
                    ->timeout(10)
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'q' => $tryQ,
                        'format' => 'json',
                        'polygon_geojson' => 1,
                        'limit' => 1,
                    ]);

                if ($resp->successful() && !empty($resp->json()[0])) {
                    $r = $resp->json()[0];
                    return [
                        'lat'         => $r['lat'],
                        'lon'         => $r['lon'],
                        'boundingbox' => $r['boundingbox'] ?? null,
                        'geojson'     => $r['geojson'] ?? null,
                        'display_name' => $r['display_name'] ?? $tryQ,
                    ];
                }
            }

            // Final fallback: plain search without polygon_geojson
            $resp = Http::withHeaders(['User-Agent' => 'ZonasiGISApp/1.0'])
                ->timeout(5)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $q, 'format' => 'json', 'limit' => 1,
                ]);
            if ($resp->successful() && !empty($resp->json()[0])) {
                $r = $resp->json()[0];
                return [
                    'lat' => $r['lat'], 'lon' => $r['lon'],
                    'boundingbox' => $r['boundingbox'] ?? null,
                    'geojson' => null,
                    'display_name' => $r['display_name'] ?? $q,
                ];
            }

            return null;
        });

        if ($data) return response()->json(['success' => true, 'data' => $data]);
        return response()->json(['success' => false, 'message' => 'Gagal geocode wilayah'], 502);
    }

    private function cleanName(string $name): string
    {
        $name = trim($name);
        $prefixes = ['PROVINSI ', 'KABUPATEN ', 'KOTA ', 'KECAMATAN ', 'DESA ', 'KELURAHAN '];
        $upper = strtoupper($name);
        foreach ($prefixes as $p) {
            if (str_starts_with($upper, $p)) {
                $name = trim(substr($name, strlen($p)));
                break;
            }
        }
        return mb_convert_case(mb_strtolower($name), MB_CASE_TITLE, 'UTF-8');
    }
}
