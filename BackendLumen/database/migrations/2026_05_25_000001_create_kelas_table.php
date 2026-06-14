<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kelas', 50);
            $table->string('tingkat', 10); // X, XI, XII atau 10, 11, 12
            $table->string('jurusan', 50)->nullable(); // IPA, IPS, MIPA, IIS, dll
            $table->string('rombel', 10)->nullable(); // 1, 2, 3, A, B, C
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
