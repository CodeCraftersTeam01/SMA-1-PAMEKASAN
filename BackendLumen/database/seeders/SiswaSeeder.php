<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\Kelas;
use App\Models\Pendaftaran;
use Faker\Factory as Faker;
use Carbon\Carbon;

class SiswaSeeder extends Seeder
{
    // public function run(): void
    // {
    //     $faker = Faker::create('id_ID');
    //     
    //     $tahunAjarans = TahunAjaran::all();
    //     $kelases = Kelas::all();
    //     $pendaftarans = Pendaftaran::where('status', 'diterima')->get();

    //     if ($tahunAjarans->isEmpty() || $kelases->isEmpty()) {
    //         return;
    //     }

    //     // Seed from pendaftaran
    //     foreach ($pendaftarans as $pendaftaran) {
    //         Siswa::create([
    //             'pendaftar_id' => $pendaftaran->id,
    //             'tahun_ajaran_id' => $tahunAjarans->random()->id,
    //             'nis' => $faker->unique()->numerify('#####'),
    //             'kelas' => $kelases->random()->nama_kelas,
    //             'nama_lengkap' => $pendaftaran->nama_lengkap,
    //             'jenis_kelamin' => $pendaftaran->jenis_kelamin,
    //             'nisn' => $pendaftaran->nisn,
    //             'tempat_lahir' => $pendaftaran->tempat_lahir,
    //             'tanggal_lahir' => $pendaftaran->tanggal_lahir,
    //             'agama' => $pendaftaran->agama,
    //             'alamat' => $pendaftaran->alamat,
    //             'nomor_hp' => $pendaftaran->nomor_hp,
    //             'email' => $pendaftaran->email,
    //             'penerima_kps' => $faker->boolean(),
    //             'nomor_kps' => $faker->numerify('KPS#######'),
    //             'penerima_kip' => $faker->boolean(),
    //             'nomor_kip' => $faker->numerify('KIP#######'),
    //             'is_active' => true,
    //             'tahun_masuk' => Carbon::now()->format('Y'),
    //             'rt' => $faker->numerify('0#'),
    //             'rw' => $faker->numerify('0#'),
    //             'kelurahan' => $faker->citySuffix(),
    //             'kode_pos' => $faker->postcode(),
    //         ]);
    //     }

    //     // Seed random siswas
    //     for ($i = 0; $i < 100; $i++) {
    //         Siswa::create([
    //             'tahun_ajaran_id' => $tahunAjarans->random()->id,
    //             'nis' => $faker->unique()->numerify('#####'),
    //             'kelas' => $faker->boolean(80) ? $kelases->random()->nama_kelas : null, // Seed some without classes!
    //             'nama_lengkap' => $faker->name(),
    //             'jenis_kelamin' => $faker->randomElement(['L', 'P']),
    //             'nisn' => $faker->unique()->numerify('##########'),
    //             'tempat_lahir' => $faker->city(),
    //             'tanggal_lahir' => $faker->date('Y-m-d', '-16 years'),
    //             'agama' => $faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
    //             'alamat' => $faker->address(),
    //             'nomor_hp' => $faker->phoneNumber(),
    //             'email' => $faker->unique()->safeEmail(),
    //             'penerima_kps' => $faker->boolean(),
    //             'nomor_kps' => $faker->numerify('KPS#######'),
    //             'penerima_kip' => $faker->boolean(),
    //             'nomor_kip' => $faker->numerify('KIP#######'),
    //             'is_active' => $faker->boolean(80), // 80% active, 20% alumni
    //             'tahun_masuk' => $faker->numberBetween(2020, 2024),
    //             'tahun_lulus' => null,
    //             'rt' => $faker->numerify('0#'),
    //             'rw' => $faker->numerify('0#'),
    //             'dusun' => $faker->streetName(),
    //             'kelurahan' => $faker->citySuffix(),
    //             'kode_pos' => $faker->postcode(),
    //             'jenis_tinggal' => $faker->randomElement(['Bersama Orang Tua', 'Asrama', 'Kos']),
    //             'alat_transportasi' => $faker->randomElement(['Sepeda Motor', 'Jalan Kaki', 'Angkutan Umum']),
    //         ]);
    //     }
    // }
}
