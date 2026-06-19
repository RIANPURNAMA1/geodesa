<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kecamatans', function (Blueprint $table) {
            $table->foreignId('kabupaten_id')->nullable()->after('id')->constrained('kabupatens')->onDelete('cascade');
            $table->string('kode', 10)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('kecamatans', function (Blueprint $table) {
            $table->dropForeign(['kabupaten_id']);
            $table->dropColumn('kabupaten_id');
            $table->string('kode', 20)->nullable()->change();
        });
    }
};
