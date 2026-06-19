<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class FotoLokasi extends Model
{
    use HasFactory;

    protected $fillable = ['lokasi_id', 'path', 'nama_file', 'urutan'];

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    protected $appends = ['url'];
}
