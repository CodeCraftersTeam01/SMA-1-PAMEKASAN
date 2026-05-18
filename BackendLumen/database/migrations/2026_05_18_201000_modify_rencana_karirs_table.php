<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rencana_karirs', function (Blueprint $table) {
            $table->string('kategori_pilihan')->nullable()->after('siswa_id'); // 'kuliah', 'kerja', 'bisnis'
            
            // Kuliah additional fields
            $table->string('jalur_seleksi')->nullable()->after('jurusan_pilihan_2'); // 'SNBP', 'SNBT', 'Mandiri', 'Lainnya'
            $table->string('status_seleksi')->nullable()->after('jalur_seleksi'); // 'Rencana', 'Diterima'

            // Kerja fields
            $table->string('nama_perusahaan')->nullable()->after('status_seleksi');
            $table->string('posisi_pekerjaan')->nullable()->after('nama_perusahaan');
            $table->string('estimasi_gaji')->nullable()->after('posisi_pekerjaan');

            // Bisnis fields
            $table->string('bidang_bisnis')->nullable()->after('estimasi_gaji');
            $table->string('nama_bisnis')->nullable()->after('bidang_bisnis');
            $table->string('modal_awal')->nullable()->after('nama_bisnis');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rencana_karirs', function (Blueprint $table) {
            $table->dropColumn([
                'kategori_pilihan',
                'jalur_seleksi',
                'status_seleksi',
                'nama_perusahaan',
                'posisi_pekerjaan',
                'estimasi_gaji',
                'bidang_bisnis',
                'nama_bisnis',
                'modal_awal'
            ]);
        });
    }
};
