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
        'foto',
        'alamat_domisili',
        'latitude',
        'longitude',
    ];

    protected $appends = ['foto_url'];

    public function getFotoUrlAttribute()
    {
        return $this->foto ? url('storage/' . $this->foto) : null;
    }

    /**
     * Relasi ke RencanaKarir
     */
    public function rencanaKarir()
    {
        return $this->hasOne(RencanaKarir::class, 'alumni_id');
    }
}
