<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kategori;
use App\Models\Lokasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Kategoris
        $kategoris = [
            ['nama' => 'Warung', 'ikon' => 'store', 'warna' => '#F59E0B', 'deskripsi' => 'Warung makan dan minuman'],
            ['nama' => 'UMKM', 'ikon' => 'briefcase', 'warna' => '#10B981', 'deskripsi' => 'Usaha Mikro Kecil Menengah'],
            ['nama' => 'Sekolah', 'ikon' => 'graduation-cap', 'warna' => '#3B82F6', 'deskripsi' => 'Lembaga pendidikan'],
            ['nama' => 'Posyandu', 'ikon' => 'heart-pulse', 'warna' => '#EF4444', 'deskripsi' => 'Pos Pelayanan Terpadu'],
            ['nama' => 'Tempat Wisata', 'ikon' => 'map-pin', 'warna' => '#8B5CF6', 'deskripsi' => 'Destinasi wisata'],
            ['nama' => 'Fasilitas Umum', 'ikon' => 'building', 'warna' => '#6B7280', 'deskripsi' => 'Fasilitas umum masyarakat'],
        ];
        foreach ($kategoris as $k) {
            Kategori::create($k);
        }

        // Users
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@zonasi.id',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Operator Desa Ciamis',
            'email' => 'operator@zonasi.id',
            'password' => Hash::make('password'),
            'role' => 'operator_desa',
        ]);

        // Lokasis (API kode values)
        $lokasiData = [
            [
                'provinsi_id' => '32', 'provinsi_nama' => 'JAWA BARAT',
                'kabupaten_id' => '3207', 'kabupaten_nama' => 'KABUPATEN CIAMIS',
                'kecamatan_id' => '3207010', 'kecamatan_nama' => 'Ciamis',
                'desa_id' => '3207010001', 'desa_nama' => 'Ciamis',
                'nama_tempat' => 'Warung Bu Sari',
                'nama_pemilik' => 'Sari Wulandari',
                'nomor_telepon' => '081234567890',
                'alamat' => 'Jl. Raya Ciamis No. 10',
                'deskripsi' => 'Warung nasi dengan menu khas Sunda',
                'latitude' => -7.3274, 'longitude' => 108.3437,
                'kategori_id' => 1, 'user_id' => 1,
            ],
            [
                'provinsi_id' => '32', 'provinsi_nama' => 'JAWA BARAT',
                'kabupaten_id' => '3207', 'kabupaten_nama' => 'KABUPATEN CIAMIS',
                'kecamatan_id' => '3207010', 'kecamatan_nama' => 'Ciamis',
                'desa_id' => '3207010001', 'desa_nama' => 'Ciamis',
                'nama_tempat' => 'UMKM Batik Ciamis',
                'nama_pemilik' => 'Ahmad Fauzi',
                'nomor_telepon' => '082345678901',
                'alamat' => 'Jl. Pasar Baru No. 5',
                'deskripsi' => 'Pengrajin batik khas Ciamis',
                'latitude' => -7.3290, 'longitude' => 108.3450,
                'kategori_id' => 2, 'user_id' => 1,
            ],
            [
                'provinsi_id' => '32', 'provinsi_nama' => 'JAWA BARAT',
                'kabupaten_id' => '3207', 'kabupaten_nama' => 'KABUPATEN CIAMIS',
                'kecamatan_id' => '3207010', 'kecamatan_nama' => 'Ciamis',
                'desa_id' => '3207010002', 'desa_nama' => 'Pawindan',
                'nama_tempat' => 'SDN 1 Ciamis',
                'nama_pemilik' => 'Kepala Sekolah',
                'nomor_telepon' => '083456789012',
                'alamat' => 'Jl. Pendidikan No. 1',
                'deskripsi' => 'Sekolah Dasar Negeri 1 Ciamis',
                'latitude' => -7.3260, 'longitude' => 108.3420,
                'kategori_id' => 3, 'user_id' => 1,
            ],
            [
                'provinsi_id' => '32', 'provinsi_nama' => 'JAWA BARAT',
                'kabupaten_id' => '3207', 'kabupaten_nama' => 'KABUPATEN CIAMIS',
                'kecamatan_id' => '3207020', 'kecamatan_nama' => 'Sindangkasih',
                'desa_id' => '3207020001', 'desa_nama' => 'Sindangkasih',
                'nama_tempat' => 'Posyandu Mawar',
                'nama_pemilik' => 'Kader Posyandu',
                'nomor_telepon' => '084567890123',
                'alamat' => 'Dusun Sukamaju',
                'deskripsi' => 'Posyandu aktif setiap Rabu',
                'latitude' => -7.3300, 'longitude' => 108.3410,
                'kategori_id' => 4, 'user_id' => 1,
            ],
            [
                'provinsi_id' => '32', 'provinsi_nama' => 'JAWA BARAT',
                'kabupaten_id' => '3207', 'kabupaten_nama' => 'KABUPATEN CIAMIS',
                'kecamatan_id' => '3207020', 'kecamatan_nama' => 'Sindangkasih',
                'desa_id' => '3207020002', 'desa_nama' => 'Sukaresik',
                'nama_tempat' => 'Wisata Situ Ciamis',
                'nama_pemilik' => 'Pemda Ciamis',
                'nomor_telepon' => '085678901234',
                'alamat' => 'Kawasan Situ Ciamis',
                'deskripsi' => 'Danau indah di tengah kota Ciamis',
                'latitude' => -7.3250, 'longitude' => 108.3400,
                'kategori_id' => 5, 'user_id' => 1,
            ],
            [
                'provinsi_id' => '32', 'provinsi_nama' => 'JAWA BARAT',
                'kabupaten_id' => '3207', 'kabupaten_nama' => 'KABUPATEN CIAMIS',
                'kecamatan_id' => '3207030', 'kecamatan_nama' => 'Lakbok',
                'desa_id' => '3207030001', 'desa_nama' => 'Lakbok',
                'nama_tempat' => 'Kantor Desa Lakbok',
                'nama_pemilik' => 'Pemerintah Desa',
                'nomor_telepon' => '086789012345',
                'alamat' => 'Jl. Desa Lakbok No. 1',
                'deskripsi' => 'Kantor Pemerintahan Desa Lakbok',
                'latitude' => -7.3350, 'longitude' => 108.3600,
                'kategori_id' => 6, 'user_id' => 1,
            ],
        ];

        foreach ($lokasiData as $l) {
            Lokasi::create($l);
        }
    }
}
