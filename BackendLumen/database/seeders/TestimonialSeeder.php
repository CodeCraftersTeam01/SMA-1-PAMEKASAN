<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            ['name' => 'Ahmad Fauzi', 'role' => 'alumni', 'graduation_year' => 2020, 'current_occupation' => 'Mahasiswa Teknik ITS Surabaya', 'message' => 'SMAN 1 Pamekasan adalah tempat terbaik untuk berkembang. Guru-gurunya sangat kompeten dan lingkungan belajarnya sangat kondusif. Berkat bimbingan di sini, saya berhasil lolos masuk ITS Surabaya!'],
            ['name' => 'Siti Rahmawati', 'role' => 'alumni', 'graduation_year' => 2021, 'current_occupation' => 'Mahasiswi Kedokteran Universitas Airlangga', 'message' => 'Fasilitas laboratorium yang lengkap sangat membantu persiapan saya masuk fakultas kedokteran. SMAN 1 Pamekasan benar-benar mencetak generasi berprestasi!'],
            ['name' => 'Muhammad Rizky', 'role' => 'alumni', 'graduation_year' => 2019, 'current_occupation' => 'Software Engineer di Jakarta', 'message' => 'Ekstrakulikuler Robotika di SMAN 1 Pamekasan membuka jalan saya menuju dunia teknologi. Senang sekali bisa menjadi bagian dari sekolah luar biasa ini.'],
            ['name' => 'Nurul Hidayah', 'role' => 'siswa', 'graduation_year' => null, 'current_occupation' => 'Kelas XII IPA', 'message' => 'Suasana belajar di SMAN 1 Pamekasan sangat menyenangkan. Teman-teman dan guru-guru sangat supportive. Saya jadi semakin semangat belajar setiap harinya!'],
            ['name' => 'Bapak Hendra Kusuma', 'role' => 'orangtua', 'graduation_year' => null, 'current_occupation' => 'Orang Tua Siswa Kelas X', 'message' => 'Sebagai orang tua, saya sangat puas dengan perkembangan anak saya sejak masuk SMAN 1 Pamekasan. Disiplin dan karakternya jauh lebih baik. Terima kasih, SMAN 1 Pamekasan!'],
            ['name' => 'Dewi Ayu Lestari', 'role' => 'alumni', 'graduation_year' => 2022, 'current_occupation' => 'Awardee Beasiswa LPDP 2024', 'message' => 'Budaya riset dan kompetisi yang kuat di SMAN 1 Pamekasan menempa saya menjadi pribadi yang tangguh. Kini saya berhasil meraih beasiswa LPDP untuk melanjutkan studi ke luar negeri!'],
        ];

        foreach ($testimonials as $testimonial) {
            DB::table('testimonials')->insert(array_merge($testimonial, [
                'avatar_url' => null,
                'status' => 'approved',
                'rating' => 5,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]));
        }
    }
}
