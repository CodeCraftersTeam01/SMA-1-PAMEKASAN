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
            $table->string('format')->default('[TAHUN_4][KODE][URUT]');
            $table->string('kode_sekolah')->nullable();
            $table->integer('panjang_urut')->default(4);
            $table->boolean('reset_per_tahun')->default(true);
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
