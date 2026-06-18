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
        Schema::table('alumnis', function (Blueprint $table) {
            $table->dropColumn(['status_saat_ini', 'nama_instansi', 'posisi_jurusan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alumnis', function (Blueprint $table) {
            $table->enum('status_saat_ini', ['kuliah', 'kerja', 'wirausaha', 'mencari_kerja', 'lainnya'])->default('mencari_kerja');
            $table->string('nama_instansi')->nullable();
            $table->string('posisi_jurusan')->nullable();
        });
    }
};
