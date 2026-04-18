<?php

namespace App\Services;

use App\Models\PengaturanNis;
use App\Models\Siswa;

class NisGeneratorService
{
    /**
     * Generate NIS berdasarkan rules di config dan tahun masuk.
     * Atau bisa dipanggil dengan mensimulasikan NIS preview.
     */
    public function generateNis($tahunMasuk = null, $isPreview = false)
    {
        $config = PengaturanNis::first();
        if (!$config) {
            return null;
        }

        if (!$tahunMasuk) {
            $tahunMasuk = date('Y'); // default tahun sekarang
        }

        $tahun4 = (string) $tahunMasuk;
        $tahun2 = substr($tahun4, -2);
        $kode = $config->kode_sekolah ?? '';

        // Tentukan nomor urut berikutnya berdasarkan setting reset
        $nextUrut = 1;
        if (!$isPreview) {
            $query = Siswa::query();
            if ($config->reset_per_tahun) {
                $query->where('tahun_masuk', $tahunMasuk);
            }
            $count = $query->count();
            $nextUrut = $count + 1;
        }

        $urutStr = str_pad((string)$nextUrut, $config->panjang_urut, '0', STR_PAD_LEFT);

        // Replace tags di dalam format
        $format = $config->format;
        $format = str_replace('[TAHUN_4]', $tahun4, $format);
        $format = str_replace('[TAHUN_2]', $tahun2, $format);
        $format = str_replace('[KODE]', $kode, $format);
        $format = str_replace('[URUT]', $urutStr, $format);

        // Preview dummy: replace tags literal dengan huruf X atau 1 jika belum diganti
        // Namun karena kita sudah mensimulasikannya jika $isPreview=true, dia jadi 001.

        return $format;
    }
}
