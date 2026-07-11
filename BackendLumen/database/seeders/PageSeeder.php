<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'title' => 'Sejarah Sekolah',
                'slug' => 'sejarah-sekolah',
                'content' => '<p>SMAN 1 Pamekasan didirikan pada tahun...</p>',
                'is_active' => true
            ],
            [
                'title' => 'Visi dan Misi',
                'slug' => 'visi-dan-misi',
                'content' => '<p><strong>Visi:</strong> Mencetak generasi cerdas, terampil, dan berakhlak mulia.</p>',
                'is_active' => true
            ],
        ];

        foreach ($data as $item) {
            Page::create($item);
        }
    }
}
