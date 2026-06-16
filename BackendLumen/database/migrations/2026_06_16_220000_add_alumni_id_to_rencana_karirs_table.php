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
        Schema::table('rencana_karirs', function (Blueprint $table) {
            $table->foreignId('alumni_id')->nullable()->after('siswa_id')->constrained('alumnis')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rencana_karirs', function (Blueprint $table) {
            $table->dropForeign(['alumni_id']);
            $table->dropColumn('alumni_id');
        });
    }
};
