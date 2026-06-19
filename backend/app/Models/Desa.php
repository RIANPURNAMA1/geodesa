<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Desa extends Model
{
    use HasFactory;

    protected $fillable = ['kecamatan_id', 'nama', 'kode', 'deskripsi'];

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class);
    }

    public function lokasis()
    {
        return $this->hasMany(Lokasi::class);
    }
}
