<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
        protected $fillable = [
                'pendaftar_id',
                'tahun_ajaran_id',
                'nis',
                'nama_lengkap',
                'is_active',
                'tahun_masuk',
                'tahun_lulus',
        ];

        // Relasi ke Pendaftaran
        public function pendaftaran()
        {
                return $this->belongsTo(Pendaftaran::class, 'pendaftar_id');
        }

        // Relasi ke TahunAjaran
        public function tahunAjaran()
        {
                return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
        }
}

