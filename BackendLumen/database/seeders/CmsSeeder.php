<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Features (Keunggulan)
        \App\Models\Feature::create(['title' => 'Akreditasi A - Unggul', 'description' => 'Diakui secara nasional dengan standar kualitas terbaik oleh BAN-S/M.', 'icon' => 'bi-award', 'order' => 1]);
        \App\Models\Feature::create(['title' => 'School of Digital Era', 'description' => 'Fokus pada pembelajaran interaktif dan keterampilan teknologi masa depan.', 'icon' => 'bi-laptop', 'order' => 2]);
        \App\Models\Feature::create(['title' => 'Program SKS', 'description' => 'Sistem Kredit Semester memungkinkan siswa lulus lebih cepat dalam 2 tahun.', 'icon' => 'bi-book', 'order' => 3]);
        \App\Models\Feature::create(['title' => 'Pendidikan Berkarakter', 'description' => 'Membangun akhlak mulia melalui pembiasaan dan bimbingan komprehensif.', 'icon' => 'bi-people', 'order' => 4]);
        \App\Models\Feature::create(['title' => 'Prestasi Nasional', 'description' => 'Mendominasi berbagai olimpiade sains dan kompetisi non-akademik di Indonesia.', 'icon' => 'bi-trophy', 'order' => 5]);
        \App\Models\Feature::create(['title' => 'Fasilitas Modern', 'description' => 'Laboratorium, perpustakaan digital, dan ruang kelas ber-AC yang nyaman.', 'icon' => 'bi-building', 'order' => 6]);

        // 2. Seed Programs (Program Peminatan)
        \App\Models\Program::create([
            'title' => 'MIPA',
            'description' => 'Fokus pada Matematika dan Ilmu Pengetahuan Alam, mencetak siswa dengan nalar analitis dan riset yang kuat.',
            'features_json' => [
                ['icon' => 'bi-pc-display', 'title' => 'Science Lab Modern', 'desc' => 'Fasilitas praktikum berstandar nasional.'],
                ['icon' => 'bi-book-half', 'title' => 'Olimpiade Sains', 'desc' => 'Pembinaan khusus olimpiade rutin.'],
                ['icon' => 'bi-award', 'title' => 'Riset Terapan', 'desc' => 'Proyek penelitian siswa setiap semester.']
            ],
            'image_path' => null,
            'order' => 1
        ]);
        \App\Models\Program::create([
            'title' => 'IPS',
            'description' => 'Fokus pada Ilmu Pengetahuan Sosial, membentuk jiwa kepemimpinan, sosial, dan kewirausahaan yang tangguh.',
            'features_json' => [
                ['icon' => 'bi-people-fill', 'title' => 'Social Studies', 'desc' => 'Analisis masalah sosial kultural.'],
                ['icon' => 'bi-heart', 'title' => 'Community Service', 'desc' => 'Program pengabdian masyarakat.'],
                ['icon' => 'bi-building-add', 'title' => 'Business Plan', 'desc' => 'Praktek kewirausahaan siswa.']
            ],
            'image_path' => null,
            'order' => 2
        ]);
        \App\Models\Program::create([
            'title' => 'Bahasa',
            'description' => 'Program khusus untuk penguasaan bahasa dan sastra internasional sebagai bekal global.',
            'features_json' => [
                ['icon' => 'bi-chat-square-text', 'title' => 'Native Speakers', 'desc' => 'Pembelajaran dengan penutur asli.'],
                ['icon' => 'bi-trophy', 'title' => 'Debate Club', 'desc' => 'Ekskul debat bahasa Inggris aktif.'],
                ['icon' => 'bi-globe', 'title' => 'Cultural Exchange', 'desc' => 'Program pertukaran pelajar.']
            ],
            'image_path' => null,
            'order' => 3
        ]);

        // 3. Seed Teachers
        \App\Models\Teacher::create([
            'name' => 'Dr. H. Muhammad Budi, M.Pd.', 
            'subject' => 'Fisika', 
            'jabatan' => 'Kepala Sekolah',
            'category' => 'Pimpinan Sekolah',
            'order' => 1
        ]);
        \App\Models\Teacher::create([
            'name' => 'Drs. Supriyanto, M.M.', 
            'subject' => 'Matematika', 
            'jabatan' => 'Wakil Kepala Sekolah Bidang Kurikulum',
            'category' => 'Wakil Kepala Sekolah',
            'order' => 2
        ]);
        \App\Models\Teacher::create([
            'name' => 'Siti Aminah, S.Pd., M.Si.', 
            'subject' => 'Biologi', 
            'jabatan' => 'Guru Mata Pelajaran',
            'category' => 'Guru Mata Pelajaran',
            'order' => 3
        ]);
        \App\Models\Teacher::create([
            'name' => 'Rina Kusumawati, S.S., M.A.', 
            'subject' => 'Bahasa Inggris', 
            'jabatan' => 'Guru Mata Pelajaran',
            'category' => 'Guru Mata Pelajaran',
            'order' => 4
        ]);
    }
}
