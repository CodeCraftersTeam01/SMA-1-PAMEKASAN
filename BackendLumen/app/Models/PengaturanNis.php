<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanNis extends Model
{
    protected $table = 'pengaturan_nis';

    protected $fillable = [
        'format',
        'kode_sekolah',
        'panjang_urut',
        'reset_per_tahun',
    ];

    protected $casts = [
        'reset_per_tahun' => 'boolean',
        'panjang_urut' => 'integer',
    ];
}
