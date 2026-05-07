<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RencanaKarir extends Model
{
    protected $table = 'rencana_karirs';

    protected $fillable = [
        'siswa_id',
        'univ_pilihan_1',
        'jurusan_pilihan_1',
        'univ_pilihan_2',
        'jurusan_pilihan_2',
    ];

    /**
     * Relasi ke Siswa
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }
}
