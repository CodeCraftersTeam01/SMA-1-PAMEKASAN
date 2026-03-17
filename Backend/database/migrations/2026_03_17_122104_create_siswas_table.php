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
        Schema::create('siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pendaftar_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tahun_ajaran_id')->constrained();
            $table->string('nis')->unique()->nullable(); // NIS diberikan setelah jadi siswa
            $table->string('nama_lengkap');
            $table->boolean('is_active')->default(true); // Jika false = Alumni
            $table->year('tahun_masuk');
            $table->year('tahun_lulus')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswas');
    }
};
