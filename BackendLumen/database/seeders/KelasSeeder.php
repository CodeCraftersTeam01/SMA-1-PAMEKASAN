<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kelas;

class KelasSeeder extends Seeder
{
    public function run(): void
    {
        $tingkatan = ['X', 'XI', 'XII'];
        $jurusan = ['MIPA', 'IPS', 'Bahasa'];
        $rombel = ['1', '2', '3'];

        foreach ($tingkatan as $tingkat) {
            foreach ($jurusan as $j) {
                foreach ($rombel as $r) {
                    Kelas::create([
                        'nama_kelas' => "$tingkat $j $r",
                        'tingkat' => $tingkat,
                        'jurusan' => $j,
                        'rombel' => $r,
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
