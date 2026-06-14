<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            $table->char('jenis_kelamin', 1)->nullable()->after('nama_lengkap');
            $table->string('tempat_lahir', 100)->nullable()->after('jenis_kelamin');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('nik', 20)->nullable()->after('tanggal_lahir');
            $table->string('agama', 50)->nullable()->after('nik');
            $table->string('kecamatan', 100)->nullable()->after('asal_sekolah');
            $table->string('email', 100)->nullable()->after('alamat');
            $table->string('nomor_hp', 20)->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            $table->dropColumn([
                'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir',
                'nik', 'agama', 'kecamatan', 'email', 'nomor_hp',
            ]);
        });
    }
};
