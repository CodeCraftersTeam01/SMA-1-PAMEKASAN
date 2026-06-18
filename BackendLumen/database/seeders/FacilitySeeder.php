<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            ['name' => 'Laboratorium IPA', 'description' => 'Lab IPA modern dilengkapi peralatan sains terkini untuk praktikum Fisika, Kimia, dan Biologi.', 'icon' => '🔬', 'order' => 1],
            ['name' => 'Laboratorium Komputer', 'description' => 'Lab komputer dengan 40 unit PC spesifikasi tinggi dan koneksi internet fiber optik berkecepatan tinggi.', 'icon' => '💻', 'order' => 2],
            ['name' => 'Perpustakaan Digital', 'description' => 'Perpustakaan ber-AC dengan koleksi lebih dari 10.000 buku dan akses e-library digital 24 jam.', 'icon' => '📚', 'order' => 3],
            ['name' => 'Lapangan Olahraga', 'description' => 'Fasilitas olahraga lengkap meliputi lapangan basket, voli, futsal, dan atletik berstandar nasional.', 'icon' => '⚽', 'order' => 4],
            ['name' => 'Aula Serbaguna', 'description' => 'Aula berkapasitas 500 orang untuk kegiatan upacara, seminar, dan pentas seni siswa.', 'icon' => '🎭', 'order' => 5],
            ['name' => 'Masjid Sekolah', 'description' => 'Masjid yang luas dan nyaman untuk pembinaan spiritual dan kegiatan keagamaan seluruh warga sekolah.', 'icon' => '🕌', 'order' => 6],
        ];

        foreach ($facilities as $facility) {
            DB::table('facilities')->insert(array_merge($facility, [
                'image_url' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]));
        }
    }
}
