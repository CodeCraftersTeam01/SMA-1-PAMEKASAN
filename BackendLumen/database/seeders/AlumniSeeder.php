<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;

class AlumniSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $statusOptions = ['kuliah', 'kerja', 'wirausaha', 'mencari_kerja', 'lainnya'];
        $jurusanSMA = ['MIPA', 'IPS', 'Bahasa'];

        for ($i = 0; $i < 20; $i++) {
            $kategori = $faker->randomElement(['kuliah', 'kerja', 'bisnis']);
            $alumniId = DB::table('alumnis')->insertGetId([
                'nisn' => $faker->unique()->numerify('##########'),
                'nama_lengkap' => $faker->name(),
                'tahun_lulus' => $faker->numberBetween(2018, 2024),
                'jurusan' => $faker->randomElement($jurusanSMA),
                'no_telepon' => $faker->phoneNumber(),
                'email' => $faker->unique()->safeEmail(),
                'alamat_domisili' => $faker->address(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            DB::table('rencana_karirs')->insert([
                'alumni_id' => $alumniId,
                'siswa_id' => null,
                'kategori_pilihan' => $kategori,
                'nama_perusahaan' => $kategori === 'kerja' ? $faker->company() : null,
                'posisi_pekerjaan' => $kategori === 'kerja' ? 'Staff' : null,
                'univ_pilihan_1' => $kategori === 'kuliah' ? 'Universitas ' . $faker->city() : null,
                'jurusan_pilihan_1' => $kategori === 'kuliah' ? $faker->jobTitle() : null,
                'nama_bisnis' => $kategori === 'bisnis' ? $faker->company() : null,
                'bidang_bisnis' => $kategori === 'bisnis' ? $faker->word() : null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
