<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LandingPageExtraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Kalender Akademik
        DB::table('academic_calendars')->insert([
            [
                'title' => 'Ujian Akhir Semester Genap',
                'description' => 'Pelaksanaan UAS untuk kelas X dan XI.',
                'event_date' => Carbon::now()->addDays(14)->toDateString(),
                'type' => 'ujian',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Penerimaan Rapor',
                'description' => 'Pembagian rapor hasil belajar siswa semester genap.',
                'event_date' => Carbon::now()->addDays(20)->toDateString(),
                'type' => 'kegiatan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Libur Kenaikan Kelas',
                'description' => 'Libur panjang semester genap.',
                'event_date' => Carbon::now()->addDays(22)->toDateString(),
                'type' => 'libur',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);

        // 2. Ruang Kelas Virtual
        DB::table('virtual_classrooms')->insert([
            [
                'subject' => 'Matematika Peminatan X',
                'teacher_name' => 'Budi Santoso, M.Pd',
                'platform' => 'Google Classroom',
                'link' => 'https://classroom.google.com/',
                'description' => 'Kelas khusus peminatan MIPA kelas X.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'subject' => 'Bahasa Inggris Lintas Minat',
                'teacher_name' => 'Siti Aminah, S.Pd',
                'platform' => 'Microsoft Teams',
                'link' => 'https://teams.microsoft.com/',
                'description' => 'Conversation practice and grammar.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'subject' => 'Fisika Lanjutan XII',
                'teacher_name' => 'Drs. H. Ahmad',
                'platform' => 'Zoom',
                'link' => 'https://zoom.us/',
                'description' => 'Persiapan ujian sekolah dan UTBK.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);

        // 3. Forum Diskusi
        DB::table('discussion_forums')->insert([
            [
                'topic' => 'Diskusi Materi Integral Tentu',
                'author' => 'Ahmad Fathan (Siswa)',
                'replies_count' => 12,
                'last_active' => Carbon::now()->subHours(2),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'topic' => 'Info Lomba OSN 2026',
                'author' => 'Bu Rina (Guru)',
                'replies_count' => 45,
                'last_active' => Carbon::now()->subMinutes(15),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'topic' => 'Persiapan Pentas Seni Sekolah',
                'author' => 'OSIS SMAN 1',
                'replies_count' => 89,
                'last_active' => Carbon::now(),
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ]
        ]);
    }
}
