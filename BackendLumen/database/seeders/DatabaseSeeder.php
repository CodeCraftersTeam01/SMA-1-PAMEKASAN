<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(PengaturanNisSeeder::class);

        // 1. Akun Admin Default
        \Illuminate\Support\Facades\DB::table('users')->insert([
            'name' => 'Administrator',
            'email' => 'admin@sman1pamekasan.sch.id',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'admin',
            'created_at' => \Carbon\Carbon::now(),
            'updated_at' => \Carbon\Carbon::now(),
        ]);

        // Akun Test User untuk kemudahan login frontend
        \Illuminate\Support\Facades\DB::table('users')->insert([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'admin',
            'created_at' => \Carbon\Carbon::now(),
            'updated_at' => \Carbon\Carbon::now(),
        ]);

        // 2. Data Alumni Dummy (10 data) menggunakan Faker
        $faker = \Faker\Factory::create('id_ID');
        $statusOptions = ['kuliah', 'kerja', 'wirausaha', 'mencari_kerja', 'lainnya'];
        $jurusanSMA = ['MIPA', 'IPS', 'Bahasa'];

        for ($i = 0; $i < 10; $i++) {
            $status = $faker->randomElement($statusOptions);
            
            \Illuminate\Support\Facades\DB::table('alumnis')->insert([
                'nisn' => $faker->unique()->numerify('##########'),
                'nama_lengkap' => $faker->name,
                'tahun_lulus' => $faker->numberBetween(2018, 2023),
                'jurusan' => $faker->randomElement($jurusanSMA),
                'status_saat_ini' => $status,
                'nama_instansi' => in_array($status, ['kuliah', 'kerja']) ? $faker->company : null,
                'posisi_jurusan' => in_array($status, ['kuliah']) ? 'Sistem Informasi' : (in_array($status, ['kerja']) ? 'Staff' : null),
                'no_telepon' => $faker->phoneNumber,
                'email' => $faker->unique()->safeEmail,
                'alamat_domisili' => $faker->address,
                'created_at' => \Carbon\Carbon::now(),
                'updated_at' => \Carbon\Carbon::now(),
            ]);
        }

        // 3. Landing Page Data
        $this->call(FacilitySeeder::class);
        $this->call(AchievementSeeder::class);
        $this->call(TestimonialSeeder::class);
        $this->call(NewsSeeder::class);
    }
}
