<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kecamatan extends Model
{
    use HasFactory;

    protected $fillable = ['kabupaten_id', 'nama', 'kode', 'deskripsi'];

    public function kabupaten()
    {
        return $this->belongsTo(Kabupaten::class);
    }

    public function desas()
    {
        return $this->hasMany(Desa::class);
    }

    public function lokasis()
    {
        return $this->hasMany(Lokasi::class);
    }

    public function getTotalDesaAttribute(): int
    {
        return $this->desas()->count();
    }

    public function getTotalLokasiAttribute(): int
    {
        return $this->lokasis()->count();
    }
}
