<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NavbarItem;

class NavbarItemSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['label' => 'Beranda', 'url' => '/', 'order' => 1, 'is_active' => true],
            ['label' => 'Profil', 'url' => '#profil', 'order' => 2, 'is_active' => true],
            ['label' => 'Keunggulan', 'url' => '#keunggulan', 'order' => 3, 'is_active' => true],
            ['label' => 'Program', 'url' => '#program', 'order' => 4, 'is_active' => true],
            ['label' => 'Akademik', 'url' => '#akademik', 'order' => 5, 'is_active' => true],
            ['label' => 'Fasilitas', 'url' => '#fasilitas', 'order' => 6, 'is_active' => true],
            ['label' => 'Berita', 'url' => '#berita', 'order' => 7, 'is_active' => true],
            ['label' => 'Galeri', 'url' => '#galeri', 'order' => 8, 'is_active' => true],
            ['label' => 'Kontak', 'url' => '#kontak', 'order' => 9, 'is_active' => true],
        ];

        foreach ($data as $item) {
            NavbarItem::create($item);
        }
    }
}
