<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
        protected $fillable = [
                'pendaftar_id',
                'tahun_ajaran_id',
                'nis',
                'kelas',
                'nama_lengkap',
                'jenis_kelamin',
                'nisn',
                'tempat_lahir',
                'tanggal_lahir',
                'agama',
                'alamat',
                'nomor_hp',
                'email',
                'penerima_kps',
                'nomor_kps',
                'penerima_kip',
                'nomor_kip',
                'is_active',
                'tahun_masuk',
                'tahun_lulus',
                'kelas_10',
                'kelas_11',
                'kelas_12',
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



        // Relasi ke RencanaKarir
        public function rencanaKarir()
        {
                return $this->hasOne(RencanaKarir::class, 'siswa_id');
        }
}

