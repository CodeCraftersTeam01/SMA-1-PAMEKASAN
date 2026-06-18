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
        Schema::create('alumnis', function (Blueprint $table) {
            $table->id();
            $table->string('nisn', 20)->unique(); // Nomor Induk Siswa Nasional
            $table->string('nama_lengkap');
            $table->year('tahun_lulus');
            $table->string('jurusan')->nullable(); // MIPA/IPS/Bahasa
            
            // Kontak
            $table->string('no_telepon')->nullable();
            $table->string('email')->nullable()->unique();
            $table->text('alamat_domisili')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumnis');
    }
};
