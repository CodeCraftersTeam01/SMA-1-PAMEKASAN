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
        'status_saat_ini',
        'nama_instansi',
        'posisi_jurusan',
        'no_telepon',
        'email',
        'alamat_domisili',
    ];
}
