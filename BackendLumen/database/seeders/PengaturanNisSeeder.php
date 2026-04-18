<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PengaturanNisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('pengaturan_nis')->insert([
            'format' => '[TAHUN_4][KODE][URUT]',
            'kode_sekolah' => '20500123',
            'panjang_urut' => 3,
            'reset_per_tahun' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    }
}
