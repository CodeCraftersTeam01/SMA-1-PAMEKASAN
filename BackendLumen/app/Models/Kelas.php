<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'nama_kelas',
        'tingkat',
        'jurusan',
        'rombel',
        'is_active',
    ];

    public function siswas()
    {
        return $this->hasMany(Siswa::class, 'kelas', 'nama_kelas');
    }
}
