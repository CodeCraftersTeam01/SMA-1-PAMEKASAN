<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Siswa;
use App\Models\AkunSiswa;

class AkunSiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Mendapatkan ID tahun ajaran aktif, atau buat baru jika belum ada
        // karena siswas membutuhkan tahun_ajaran_id
        $tahunAjaranId = DB::table('tahun_ajarans')->value('id');
        if (!$tahunAjaranId) {
            $tahunAjaranId = DB::table('tahun_ajarans')->insertGetId([
                'tahun' => '2025/2026',
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }

        // 1. Create the Master Siswa record
        $siswa = Siswa::create([
            'pendaftar_id' => null,
            'tahun_ajaran_id' => $tahunAjaranId,
            'nis' => '123456',
            'nama_lengkap' => 'Siswa Test',
            'is_active' => true,
            'tahun_masuk' => date('Y') - 2, // Assuming Grade 12
            'tahun_lulus' => null,
        ]);

        $this->command->info('Siswa master data and related AkunSiswa auth record created successfully (NIS: 123456).');
    }
}