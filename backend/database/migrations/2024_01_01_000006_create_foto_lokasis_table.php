<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foto_lokasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lokasi_id')->constrained('lokasis')->onDelete('cascade');
            $table->string('path');
            $table->string('nama_file')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foto_lokasis');
    }
};
