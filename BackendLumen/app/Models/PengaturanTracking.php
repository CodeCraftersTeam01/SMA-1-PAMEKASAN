<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanTracking extends Model
{
    protected $table = 'pengaturan_trackings';

    protected $fillable = [
        'is_open',
        'tahun_ajaran_id',
    ];

    protected $casts = [
        'is_open' => 'boolean',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }
}
