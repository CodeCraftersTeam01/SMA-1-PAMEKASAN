<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alumni extends Model
{
    protected $table = 'alumnis';

    protected $fillable = [
        'nisn',
        'nama_lengkap',
        'tahun_lulus',
        'jurusan',
        'no_telepon',
        'email',
        'alamat_domisili',
    ];

    /**
     * Relasi ke RencanaKarir
     */
    public function rencanaKarir()
    {
        return $this->hasOne(RencanaKarir::class, 'alumni_id');
    }
}
