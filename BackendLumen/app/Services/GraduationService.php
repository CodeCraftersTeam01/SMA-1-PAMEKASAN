<?php

namespace App\Services;

use App\Models\TahunAjaran;
use App\Models\Siswa;
use App\Models\Alumni;

class GraduationService
{
    /**
     * Check all active students and graduate them if they meet the criteria.
     */
    public static function checkAll()
    {
        $activeTa = TahunAjaran::where('is_active', true)->first();
        if (!$activeTa) return 0;

        $activeYear = (int) substr($activeTa->tahun, 0, 4);

        $siswas = Siswa::with(['rencanaKarir', 'tahunAjaran'])
            ->where('is_active', 1)
            ->get();

        return self::processGraduation($siswas, $activeYear);
    }

    /**
     * Check a specific set of student IDs and graduate them if they meet the criteria.
     */
    public static function checkByIds(array $ids)
    {
        $activeTa = TahunAjaran::where('is_active', true)->first();
        if (!$activeTa) return 0;

        $activeYear = (int) substr($activeTa->tahun, 0, 4);

        $siswas = Siswa::with(['rencanaKarir', 'tahunAjaran'])
            ->whereIn('id', $ids)
            ->where('is_active', 1)
            ->get();

        return self::processGraduation($siswas, $activeYear);
    }

    /**
     * Process graduation for a collection of students.
     */
    private static function processGraduation($siswas, $activeYear)
    {
        $count = 0;

        foreach ($siswas as $siswa) {
            $selectedTa = $siswa->tahunAjaran;
            $selectedYear = $selectedTa ? (int) substr($selectedTa->tahun, 0, 4) : $activeYear;

            $tahunMasuk = $siswa->tahun_masuk ?: $selectedYear;

            if (abs($activeYear - $tahunMasuk) >= 3) {
                $tahunLulus = $siswa->tahun_lulus ?: ($tahunMasuk + 3);

                // 1. Insert ke tabel alumnis
                $alumni = Alumni::create([
                    'nisn' => $siswa->nisn,
                    'nama_lengkap' => $siswa->nama_lengkap,
                    'tahun_lulus' => $tahunLulus,
                    'jurusan' => null, 
                    'no_telepon' => $siswa->nomor_hp,
                    'email' => $siswa->email,
                    'alamat_domisili' => $siswa->alamat,
                ]);

                // 2. Relasi ke rencana karir
                if ($siswa->rencanaKarir) {
                    $siswa->rencanaKarir->update(['alumni_id' => $alumni->id]);
                }

                // 3. Update status siswa menjadi tidak aktif dan set tahun lulus
                $siswa->update([
                    'is_active' => 0,
                    'tahun_lulus' => $tahunLulus
                ]);

                $count++;
            }
        }

        return $count;
    }
}
