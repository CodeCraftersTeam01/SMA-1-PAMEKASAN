<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LandingPageSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\LandingPageSetting::create([
            'hero_title' => 'Mencetak Generasi Cerdas & Berwawasan Global',
            'hero_subtitle' => 'Selamat Datang di SMAN 1 Pamekasan! Sekolah Tangguh, Berakhlak, dan Berwawasan Digital dengan kurikulum unggulan dan fasilitas modern.',
            'ppdb_link' => 'http://localhost:5173',
            'video_link' => '#video-profil',
            'headmaster_name' => 'Drs. Moh. Ali, M.Pd',
            'headmaster_title' => 'Kepala SMAN 1 Pamekasan',
            'headmaster_message' => 'Segala puji bagi Allah SWT Tuhan Yang Maha Esa atas rahmat dan karunia-Nya. Selamat datang di portal resmi SMAN 1 Pamekasan.\n\nDi era digital yang serba cepat ini, kami berkomitmen tidak hanya mencetak siswa yang unggul secara akademik, namun juga tangguh karakternya, serta memiliki wawasan teknologi yang mumpuni untuk bersaing secara global. Mari bersama mewujudkan masa depan yang cemerlang!',
            'contact_email' => 'info@sman1pamekasan.sch.id',
            'contact_phone' => '+62 811-2233-4455',
            'contact_address' => 'Jl. Pintu Gerbang No. 42, Kab. Pamekasan, Jawa Timur',
            'contact_map_url' => 'https://maps.google.com'
        ]);
    }
}
