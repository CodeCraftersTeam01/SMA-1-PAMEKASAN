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
            $table->string('pendidikan_ayah')->nullable()->after('alamat_ayah');
            $table->string('penghasilan_ayah')->nullable()->after('pendidikan_ayah');
            
            $table->string('pendidikan_ibu')->nullable()->after('alamat_ibu');
            $table->string('penghasilan_ibu')->nullable()->after('pendidikan_ibu');
            
            $table->string('pendidikan_wali')->nullable()->after('alamat_wali');
            $table->string('penghasilan_wali')->nullable()->after('pendidikan_wali');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftarans', function (Blueprint $table) {
            $table->dropColumn([
                'pendidikan_ayah', 'penghasilan_ayah',
                'pendidikan_ibu', 'penghasilan_ibu',
                'pendidikan_wali', 'penghasilan_wali'
            ]);
        });
    }
};
