<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PengaturanTracking;

class PengaturanTrackingSeeder extends Seeder
{
    public function run(): void
    {
        $tahunAjaran = \App\Models\TahunAjaran::where('is_active', true)->first();
        PengaturanTracking::create([
            'is_open' => true,
            'tahun_ajaran_id' => $tahunAjaran ? $tahunAjaran->id : null,
        ]);
    }
}
