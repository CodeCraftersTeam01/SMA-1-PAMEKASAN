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
        Schema::table('pendaftarans', function (Blueprint $table) {
            // Hapus kolom lama
            if (Schema::hasColumn('pendaftarans', 'nama_orang_tua')) {
                $table->dropColumn('nama_orang_tua');
            }

            // Data Ayah
            $table->string('nama_ayah')->nullable();
            $table->string('pekerjaan_ayah')->nullable();
            $table->string('no_hp_ayah')->nullable();
            $table->text('alamat_ayah')->nullable();

            // Data Ibu
            $table->string('nama_ibu')->nullable();
            $table->string('pekerjaan_ibu')->nullable();
            $table->string('no_hp_ibu')->nullable();
            $table->text('alamat_ibu')->nullable();

            // Data Wali
            $table->string('nama_wali')->nullable();
            $table->string('pekerjaan_wali')->nullable();
            $table->string('no_hp_wali')->nullable();
            $table->text('alamat_wali')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            $table->string('nama_orang_tua')->nullable();
            
            $table->dropColumn([
                'nama_ayah', 'pekerjaan_ayah', 'no_hp_ayah', 'alamat_ayah',
                'nama_ibu', 'pekerjaan_ibu', 'no_hp_ibu', 'alamat_ibu',
                'nama_wali', 'pekerjaan_wali', 'no_hp_wali', 'alamat_wali'
            ]);
        });
    }
};
