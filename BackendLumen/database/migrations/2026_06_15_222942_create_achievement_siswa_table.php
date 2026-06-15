<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('achievement_siswa', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('achievement_id');
            $table->unsignedBigInteger('siswa_id');
            $table->timestamps();

            $table->foreign('achievement_id')->references('id')->on('achievements')->onDelete('cascade');
            $table->foreign('siswa_id')->references('id')->on('siswas')->onDelete('cascade');
        });

        // Migrate existing data from achievements table
        $achievements = DB::table('achievements')->whereNotNull('siswa_id')->get();
        foreach ($achievements as $achievement) {
            DB::table('achievement_siswa')->insert([
                'achievement_id' => $achievement->id,
                'siswa_id' => $achievement->siswa_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Drop the old column
        Schema::table('achievements', function (Blueprint $table) {
            // Depending on how it was created, we might need to drop foreign key first
            // But in Lumen/Laravel if it wasn't constrained, we can just drop it.
            // Let's check if there's a constraint. In a previous migration I used constrained().
            // So we should drop the foreign key. The FK name is usually achievements_siswa_id_foreign
            $table->dropForeign(['siswa_id']);
            $table->dropColumn('siswa_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achievements', function (Blueprint $table) {
            $table->unsignedBigInteger('siswa_id')->nullable();
            $table->foreign('siswa_id')->references('id')->on('siswas')->onDelete('set null');
        });

        // Migrate data back
        $pivots = DB::table('achievement_siswa')->get();
        foreach ($pivots as $pivot) {
            DB::table('achievements')
                ->where('id', $pivot->achievement_id)
                ->update(['siswa_id' => $pivot->siswa_id]);
        }

        Schema::dropIfExists('achievement_siswa');
    }
};
