<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Extracurricular;

class ExtracurricularSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'name' => 'Pramuka',
                'description' => 'Membentuk karakter disiplin, mandiri, dan berjiwa kepemimpinan.',
                'image_path' => 'https://via.placeholder.com/400x300?text=Pramuka',
            ],
            [
                'name' => 'Paskibra',
                'description' => 'Pasukan Pengibar Bendera Pusaka untuk kedisiplinan dan rasa nasionalisme tinggi.',
                'image_path' => 'https://via.placeholder.com/400x300?text=Paskibra',
            ],
            [
                'name' => 'PMR',
                'description' => 'Palang Merah Remaja melatih siswa peduli sosial dan tanggap medis.',
                'image_path' => 'https://via.placeholder.com/400x300?text=PMR',
            ],
            [
                'name' => 'KIR',
                'description' => 'Kelompok Ilmiah Remaja untuk siswa yang gemar penelitian dan sains.',
                'image_path' => 'https://via.placeholder.com/400x300?text=KIR',
            ],
            [
                'name' => 'Paduan Suara',
                'description' => 'Ekskul seni vokal yang berprestasi di tingkat provinsi.',
                'image_path' => 'https://via.placeholder.com/400x300?text=Paduan+Suara',
            ],
            [
                'name' => 'Basket',
                'description' => 'Klub basket sekolah dengan berbagai prestasi lokal.',
                'image_path' => 'https://via.placeholder.com/400x300?text=Basket',
            ]
        ];

        foreach ($data as $item) {
            Extracurricular::create($item);
        }
    }
}
