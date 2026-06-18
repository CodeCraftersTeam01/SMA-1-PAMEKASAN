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
        Schema::create('rencana_karirs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->nullable()->constrained('siswas')->onDelete('cascade');
            $table->foreignId('alumni_id')->nullable()->constrained('alumnis')->onDelete('set null');
            $table->string('kategori_pilihan')->nullable(); // 'kuliah', 'kerja', 'bisnis'
            $table->string('univ_pilihan_1')->nullable();
            $table->string('jurusan_pilihan_1')->nullable();
            $table->string('univ_pilihan_2')->nullable();
            $table->string('jurusan_pilihan_2')->nullable();
            
            // Kuliah additional fields
            $table->string('jalur_seleksi')->nullable(); // 'SNBP', 'SNBT', 'Mandiri', 'Lainnya'
            $table->string('status_seleksi')->nullable(); // 'Rencana', 'Diterima'

            // Kerja fields
            $table->string('nama_perusahaan')->nullable();
            $table->string('posisi_pekerjaan')->nullable();
            $table->string('estimasi_gaji')->nullable();

            // Bisnis fields
            $table->string('bidang_bisnis')->nullable();
            $table->string('nama_bisnis')->nullable();
            $table->string('modal_awal')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rencana_karirs');
    }
};
