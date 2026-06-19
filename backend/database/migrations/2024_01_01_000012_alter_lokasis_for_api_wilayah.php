<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Lokasis table ──
        Schema::table('lokasis', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
            $table->dropForeign(['desa_id']);
        });

        Schema::table('lokasis', function (Blueprint $table) {
            $table->dropColumn(['kecamatan_id', 'desa_id']);
        });

        Schema::table('lokasis', function (Blueprint $table) {
            $table->string('provinsi_id', 10)->nullable()->after('id');
            $table->string('provinsi_nama')->nullable()->after('provinsi_id');
            $table->string('kabupaten_id', 10)->nullable()->after('provinsi_nama');
            $table->string('kabupaten_nama')->nullable()->after('kabupaten_id');
            $table->string('kecamatan_id', 20);
            $table->string('kecamatan_nama')->nullable()->after('kecamatan_id');
            $table->string('desa_id', 20);
            $table->string('desa_nama')->nullable()->after('desa_id');
        });

        // ── Users table ──
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
            $table->dropForeign(['desa_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('kecamatan_id', 20)->nullable()->change();
            $table->string('desa_id', 20)->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('provinsi_id', 10)->nullable()->after('desa_id');
            $table->string('provinsi_nama')->nullable()->after('provinsi_id');
            $table->string('kabupaten_id', 10)->nullable()->after('provinsi_nama');
            $table->string('kabupaten_nama')->nullable()->after('kabupaten_id');
            $table->string('kecamatan_nama')->nullable()->after('kecamatan_id');
            $table->string('desa_nama')->nullable()->after('desa_id');
        });
    }

    public function down(): void
    {
        // ── Users table ──
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'provinsi_id', 'provinsi_nama',
                'kabupaten_id', 'kabupaten_nama',
                'kecamatan_nama', 'desa_nama',
            ]);
            $table->foreignId('kecamatan_id')->change();
            $table->foreignId('desa_id')->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('id')->on('kecamatans')->onDelete('set null');
            $table->foreign('desa_id')->references('id')->on('desas')->onDelete('set null');
        });

        // ── Lokasis table ──
        Schema::table('lokasis', function (Blueprint $table) {
            $table->dropColumn([
                'provinsi_id', 'provinsi_nama',
                'kabupaten_id', 'kabupaten_nama',
                'kecamatan_nama', 'desa_nama',
            ]);
            $table->foreignId('kecamatan_id')->after('id');
            $table->foreignId('desa_id');
        });

        Schema::table('lokasis', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('id')->on('kecamatans')->onDelete('cascade');
            $table->foreign('desa_id')->references('id')->on('desas')->onDelete('cascade');
        });
    }
};
