<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TahunAjaran;

class TahunAjaranSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['tahun' => '2023/2024 Ganjil', 'is_active' => false],
            ['tahun' => '2023/2024 Genap', 'is_active' => false],
            ['tahun' => '2024/2025 Ganjil', 'is_active' => false],
            ['tahun' => '2024/2025 Genap', 'is_active' => true],
        ];

        foreach ($data as $item) {
            TahunAjaran::create($item);
        }
    }
}
