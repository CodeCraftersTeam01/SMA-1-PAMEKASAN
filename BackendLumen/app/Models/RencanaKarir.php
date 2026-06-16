<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RencanaKarir extends Model
{
    protected $table = 'rencana_karirs';

    protected $fillable = [
        'siswa_id',
        'alumni_id',
        'kategori_pilihan',
        'univ_pilihan_1',
        'jurusan_pilihan_1',
        'univ_pilihan_2',
        'jurusan_pilihan_2',
        'jalur_seleksi',
        'status_seleksi',
        'nama_perusahaan',
        'posisi_pekerjaan',
        'estimasi_gaji',
        'bidang_bisnis',
        'nama_bisnis',
        'modal_awal',
    ];

    /**
     * Relasi ke Siswa
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    /**
     * Relasi ke Alumni
     */
    public function alumni()
    {
        return $this->belongsTo(Alumni::class, 'alumni_id');
    }
}
