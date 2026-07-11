<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class StudentTestAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Menyisipkan data akun test ke tabel users
        // Catatan: Jika kolom nis, nisn, atau student_grade belum ada di tabel users,
        // pastikan Anda menambahkan kolom tersebut di migration users.
        DB::table('users')->insert([
            'name'          => 'Siswa Test Alpha',
            'email'         => 'siswa@example.com',
            'role'          => 'siswa',
            'password'      => Hash::make('12345678'),
            'created_at'    => date('Y-m-d H:i:s'),
            'updated_at'    => date('Y-m-d H:i:s'),
        ]);

        $this->command->info('Akun Siswa Test Alpha berhasil dibuat.');
    }
}
