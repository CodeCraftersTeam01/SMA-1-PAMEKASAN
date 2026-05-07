<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;
use Laravel\Lumen\Auth\Authorizable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class AkunSiswa extends Model implements AuthenticatableContract, AuthorizableContract, JWTSubject
{
    use Authenticatable, Authorizable;

    protected $table = 'akun_siswas';

    protected $fillable = [
        'siswa_id',
        'nis',
        'password',
        'is_password_changed',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Relasi ke tabel siswas
     */
    public function dataAkademik()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
