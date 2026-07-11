<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Announcement;
use Carbon\Carbon;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'title' => 'Pengumuman PPDB',
                'content' => 'Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 telah dibuka! Segera daftarkan diri Anda secara online.',
                'is_active' => true,
                'type' => 'custom',
            ],
            [
                'title' => 'Libur Hari Raya',
                'content' => 'Pemberitahuan: Sekolah libur menyambut Hari Raya Idul Fitri dari tanggal 20 April - 27 April 2026.',
                'is_active' => true,
                'type' => 'custom',
            ],
            [
                'title' => 'Prestasi OSN',
                'content' => 'Selamat! Siswa SMAN 1 Pamekasan berhasil meraih medali emas pada Olimpiade Sains Nasional (OSN) tingkat Provinsi.',
                'is_active' => true,
                'type' => 'custom',
            ]
        ];

        foreach ($data as $item) {
            Announcement::create($item);
        }
    }
}
