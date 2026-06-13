<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $news = [
            [
                'title' => 'SMAN 1 Pamekasan Raih Akreditasi A+ dari BAN-S/M',
                'slug' => 'sman-1-pamekasan-raih-akreditasi-a-plus',
                'excerpt' => 'SMAN 1 Pamekasan berhasil mempertahankan dan meningkatkan status akreditasinya menjadi A+ setelah melalui serangkaian penilaian ketat dari BAN-S/M.',
                'content' => 'SMAN 1 Pamekasan kembali membuktikan kualitasnya dengan berhasil meraih Akreditasi A+ dari Badan Akreditasi Nasional Sekolah/Madrasah (BAN-S/M). Pencapaian ini merupakan bukti nyata komitmen seluruh warga sekolah dalam menjaga dan meningkatkan standar pendidikan.',
                'category' => 'Prestasi',
                'author' => 'Humas SMAN 1 Pamekasan',
                'published_at' => Carbon::now()->subDays(5),
            ],
            [
                'title' => 'Pendaftaran PPDB 2025/2026 Resmi Dibuka, Kuota Terbatas!',
                'slug' => 'pendaftaran-ppdb-2025-2026-resmi-dibuka',
                'excerpt' => 'Penerimaan Peserta Didik Baru (PPDB) untuk tahun ajaran 2025/2026 telah resmi dibuka. Segera daftarkan diri Anda sebelum kuota penuh!',
                'content' => 'SMAN 1 Pamekasan dengan bangga mengumumkan pembukaan Penerimaan Peserta Didik Baru (PPDB) untuk tahun ajaran 2025/2026. Pendaftaran dapat dilakukan secara online melalui website resmi atau datang langsung ke sekolah. Kuota sangat terbatas, jadi segera daftarkan diri Anda.',
                'category' => 'PPDB',
                'author' => 'Panitia PPDB',
                'published_at' => Carbon::now()->subDays(10),
            ],
            [
                'title' => 'Tim Olimpiade Sains SMAN 1 Pamekasan Juara di Tingkat Nasional',
                'slug' => 'tim-olimpiade-sains-juara-nasional',
                'excerpt' => 'Tiga siswa SMAN 1 Pamekasan berhasil membawa pulang medali emas, perak, dan perunggu dari ajang Olimpiade Sains Nasional (OSN) 2024.',
                'content' => 'Kebanggaan kembali hadir dari SMAN 1 Pamekasan. Tiga siswanya berhasil menorehkan prestasi gemilang di ajang Olimpiade Sains Nasional (OSN) 2024. Ahmad Farid meraih emas di bidang Matematika, Siti Nur meraih perak di bidang Kimia, dan Reza Pratama meraih perunggu di bidang Fisika.',
                'category' => 'Prestasi',
                'author' => 'Tim Akademik',
                'published_at' => Carbon::now()->subDays(20),
            ],
        ];

        foreach ($news as $item) {
            DB::table('news')->insert(array_merge($item, [
                'image_url' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]));
        }
    }
}
