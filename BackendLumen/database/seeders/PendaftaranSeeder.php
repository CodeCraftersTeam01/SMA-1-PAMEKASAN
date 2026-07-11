<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pendaftaran;
use Faker\Factory as Faker;
use Carbon\Carbon;

class PendaftaranSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $jalur = ['zonasi', 'afirmasi', 'prestasi', 'perpindahan_tugas'];
        $status = ['pending', 'diterima', 'ditolak'];

        for ($i = 0; $i < 50; $i++) {
            Pendaftaran::create([
                'no_pendaftaran' => 'PPDB' . Carbon::now()->format('Y') . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'nisn' => $faker->unique()->numerify('##########'),
                'nama_lengkap' => $faker->name(),
                'jenis_kelamin' => $faker->randomElement(['L', 'P']),
                'tempat_lahir' => $faker->city(),
                'tanggal_lahir' => $faker->date('Y-m-d', '-15 years'),
                'nik' => $faker->unique()->numerify('################'),
                'agama' => $faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
                'asal_sekolah' => 'SMPN ' . $faker->numberBetween(1, 10) . ' ' . $faker->city(),
                'kecamatan' => $faker->citySuffix(),
                'status' => $faker->randomElement($status),
                'alamat' => $faker->address(),
                'email' => $faker->unique()->safeEmail(),
                'nomor_hp' => $faker->phoneNumber(),
                'jalur' => $faker->randomElement($jalur),
                'nama_ayah' => $faker->name('male'),
                'pekerjaan_ayah' => $faker->jobTitle(),
                'no_hp_ayah' => $faker->phoneNumber(),
                'alamat_ayah' => $faker->address(),
                'pendidikan_ayah' => $faker->randomElement(['SMA', 'S1', 'S2', 'D3']),
                'penghasilan_ayah' => $faker->randomElement(['< 1 Juta', '1 - 3 Juta', '3 - 5 Juta', '> 5 Juta']),
                'nama_ibu' => $faker->name('female'),
                'pekerjaan_ibu' => 'Ibu Rumah Tangga',
                'no_hp_ibu' => $faker->phoneNumber(),
                'alamat_ibu' => $faker->address(),
                'pendidikan_ibu' => $faker->randomElement(['SMA', 'S1', 'S2', 'D3']),
                'penghasilan_ibu' => $faker->randomElement(['< 1 Juta', '1 - 3 Juta', '3 - 5 Juta', '> 5 Juta']),
            ]);
        }
    }
}
