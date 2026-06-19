<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    use HasFactory;

    protected $fillable = ['nama', 'ikon', 'warna', 'deskripsi'];

    public function lokasis()
    {
        return $this->hasMany(Lokasi::class);
    }
}
