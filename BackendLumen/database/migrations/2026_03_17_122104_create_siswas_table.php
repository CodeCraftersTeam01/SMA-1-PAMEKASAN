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
            $table->foreignId('pendaftar_id')->nullable()->constrained('pendaftarans')->onDelete('set null');
            $table->foreignId('tahun_ajaran_id')->constrained();
            $table->string('nis')->unique()->nullable();
            $table->string('kelas', 50)->nullable();
            $table->string('kelas_10')->nullable();
            $table->string('kelas_11')->nullable();
            $table->string('kelas_12')->nullable();
            $table->string('nama_lengkap');
            $table->char('jenis_kelamin', 1)->nullable();
            $table->string('nisn', 20)->nullable()->unique();
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('agama', 50)->nullable();
            $table->text('alamat')->nullable();
            $table->string('nomor_hp', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->boolean('penerima_kps')->default(false);
            $table->string('nomor_kps', 50)->nullable();
            $table->boolean('penerima_kip')->default(false);
            $table->string('nomor_kip', 50)->nullable();
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
