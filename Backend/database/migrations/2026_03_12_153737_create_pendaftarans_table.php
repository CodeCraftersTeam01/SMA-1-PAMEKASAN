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
        Schema::create('pendaftars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')->constrained();
            $table->string('no_pendaftaran')->unique();
            $table->string('nisn', 10)->unique();
            $table->string('nama_lengkap');
            $table->string('asal_sekolah');
            $table->enum('status', ['pending', 'diterima', 'ditolak'])->default('pending');
            $table->text('alamat');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftarans');
    }
};
