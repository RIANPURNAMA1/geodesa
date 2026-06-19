<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lokasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'provinsi_id',
        'provinsi_nama',
        'kabupaten_id',
        'kabupaten_nama',
        'kecamatan_id',
        'kecamatan_nama',
        'desa_id',
        'desa_nama',
        'kategori_id',
        'user_id',
        'nama_tempat',
        'nama_pemilik',
        'nomor_telepon',
        'alamat',
        'deskripsi',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_active' => 'boolean',
    ];

    protected $appends = ['rating_rata_rata', 'jumlah_komentar'];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fotos()
    {
        return $this->hasMany(FotoLokasi::class, 'lokasi_id')->orderBy('urutan');
    }

    public function getFotoUtamaAttribute(): ?string
    {
        $foto = $this->fotos()->first();
        return $foto ? $foto->url : null;
    }

    public function komentars()
    {
        return $this->hasMany(Komentar::class);
    }

    public function getRatingRataRataAttribute(): ?float
    {
        return round($this->komentars()->avg('rating'), 1);
    }

    public function getJumlahKomentarAttribute(): int
    {
        return $this->komentars()->count();
    }
}
