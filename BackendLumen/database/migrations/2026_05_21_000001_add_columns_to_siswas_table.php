<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->char('jenis_kelamin', 1)->nullable()->after('nama_lengkap');
            $table->string('nisn', 20)->nullable()->unique()->after('jenis_kelamin');
            $table->string('tempat_lahir', 100)->nullable()->after('nisn');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('agama', 50)->nullable()->after('tanggal_lahir');
            $table->text('alamat')->nullable()->after('agama');
            $table->string('nomor_hp', 20)->nullable()->after('alamat');
            $table->string('email', 100)->nullable()->after('nomor_hp');
            $table->boolean('penerima_kps')->default(false)->after('email');
            $table->string('nomor_kps', 50)->nullable()->after('penerima_kps');
            $table->boolean('penerima_kip')->default(false)->after('nomor_kps');
            $table->string('nomor_kip', 50)->nullable()->after('penerima_kip');
        });
    }

    public function down(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->dropColumn([
                'jenis_kelamin',
                'nisn',
                'tempat_lahir',
                'tanggal_lahir',
                'agama',
                'alamat',
                'nomor_hp',
                'email',
                'penerima_kps',
                'nomor_kps',
                'penerima_kip',
                'nomor_kip',
            ]);
        });
    }
};
