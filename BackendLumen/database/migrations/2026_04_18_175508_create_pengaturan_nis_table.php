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
        Schema::create('pengaturan_nis', function (Blueprint $table) {
            $table->id();
            $table->string('format')->default('[TAHUN_2]-[KODE]-[URUT]'); // Contoh template
            $table->string('kode_sekolah')->nullable();
            $table->integer('panjang_urut')->default(4); // Cnth: 4 = 0001
            $table->boolean('reset_per_tahun')->default(true); // Reset urut per tahun masuk
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_nis');
    }
};
