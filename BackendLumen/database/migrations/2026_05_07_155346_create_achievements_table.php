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
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('siswa_id')->nullable();
            $table->string('title');
            $table->string('student_name')->nullable();
            $table->text('description')->nullable();
            $table->enum('category', ['akademik', 'non-akademik', 'olahraga', 'seni'])->default('akademik');
            $table->year('year');
            $table->string('level')->nullable(); // Tingkat kota/provinsi/nasional
            $table->string('image_url')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->timestamps();

            $table->foreign('siswa_id')->references('id')->on('siswas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
