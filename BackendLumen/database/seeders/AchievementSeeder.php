<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            ['title' => 'Juara 1 Olimpiade Sains Nasional Bidang Matematika', 'description' => 'Siswa SMAN 1 Pamekasan berhasil meraih Juara 1 OSN tingkat Nasional untuk bidang Matematika.', 'category' => 'akademik', 'year' => 2024, 'level' => 'Nasional'],
            ['title' => 'Juara 2 Lomba Karya Ilmiah Remaja Provinsi Jawa Timur', 'description' => 'Tim peneliti muda SMAN 1 Pamekasan meraih juara 2 LKIR se-Jawa Timur dengan riset energi terbarukan.', 'category' => 'akademik', 'year' => 2024, 'level' => 'Provinsi'],
            ['title' => 'Juara 1 Kejurda Pencak Silat Pelajar Jawa Timur', 'description' => 'Atlet pencak silat SMAN 1 Pamekasan meraih emas pada Kejuaraan Daerah Pelajar tingkat Jawa Timur.', 'category' => 'olahraga', 'year' => 2023, 'level' => 'Provinsi'],
            ['title' => 'Terbaik 3 Festival Seni Pelajar Tingkat Kabupaten', 'description' => 'Kelompok paduan suara SMAN 1 Pamekasan meraih terbaik 3 pada Festival Seni Pelajar se-Kabupaten Pamekasan.', 'category' => 'seni', 'year' => 2023, 'level' => 'Kabupaten'],
            ['title' => 'Akreditasi A dari BAN-S/M', 'description' => 'SMAN 1 Pamekasan berhasil mempertahankan status Akreditasi A dari Badan Akreditasi Nasional Sekolah/Madrasah.', 'category' => 'akademik', 'year' => 2023, 'level' => 'Nasional'],
        ];

        foreach ($achievements as $achievement) {
            DB::table('achievements')->insert(array_merge($achievement, [
                'image_url' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]));
        }
    }
}
