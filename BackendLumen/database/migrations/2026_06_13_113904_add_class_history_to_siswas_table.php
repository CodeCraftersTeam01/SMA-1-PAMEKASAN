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
        Schema::table('siswas', function (Blueprint $table) {
            $table->string('kelas_10')->nullable()->after('kelas');
            $table->string('kelas_11')->nullable()->after('kelas_10');
            $table->string('kelas_12')->nullable()->after('kelas_11');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->dropColumn(['kelas_10', 'kelas_11', 'kelas_12']);
        });
    }
};
