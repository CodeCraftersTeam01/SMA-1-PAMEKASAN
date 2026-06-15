<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $table = 'achievements';

    protected $fillable = [
        'title', 'student_name', 'description', 'category', 'year', 'level', 'image_url',
    ];

    public function siswas()
    {
        return $this->belongsToMany(Siswa::class, 'achievement_siswa', 'achievement_id', 'siswa_id');
    }
}
