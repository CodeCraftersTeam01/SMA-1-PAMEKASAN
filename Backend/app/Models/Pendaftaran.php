<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $fillable = [
        'no_pendaftaran',
        'nisn',
        'nama_lengkap',
        'asal_sekolah',
        'status',
        'alamat'
];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class);
    }
}
