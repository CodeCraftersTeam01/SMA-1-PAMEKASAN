<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $fillable = [
        'no_pendaftaran',
        'nisn',
        'nama_lengkap',
        'nama_ayah',
        'pekerjaan_ayah', 'no_hp_ayah', 'alamat_ayah', 'pendidikan_ayah', 'penghasilan_ayah',
        'nama_ibu', 'pekerjaan_ibu', 'no_hp_ibu', 'alamat_ibu', 'pendidikan_ibu', 'penghasilan_ibu',
        'nama_wali', 'pekerjaan_wali', 'no_hp_wali', 'alamat_wali', 'pendidikan_wali', 'penghasilan_wali',
        'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir',
        'nik',
        'agama',
        'asal_sekolah',
        'kecamatan',
        'status',
        'alamat',
        'email',
        'nomor_hp',
        'jalur',
        'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos', 'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class);
    }
}
