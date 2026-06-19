<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'role',
        'provinsi_id',
        'provinsi_nama',
        'kabupaten_id',
        'kabupaten_nama',
        'kecamatan_id',
        'kecamatan_nama',
        'desa_id',
        'desa_nama',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isOperatorDesa(): bool
    {
        return $this->role === 'operator_desa';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    public function lokasis()
    {
        return $this->hasMany(Lokasi::class);
    }
}
