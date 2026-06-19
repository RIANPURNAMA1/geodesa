<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            $table->string('kecamatan_id', 20)->nullable()->change();
            $table->string('desa_id', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            $table->string('kecamatan_id', 20)->nullable(false)->change();
            $table->string('desa_id', 20)->nullable(false)->change();
        });
    }
};
