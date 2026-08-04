<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * =========================================================================
     * Security Hardening Phase 1 — Task T2: Database Migration Schema
     * =========================================================================
     *
     * SCOPE:
     *   Migration ini hanya bertanggung jawab terhadap perubahan skema (DDL).
     *   Tidak ada pemrosesan, enkripsi, atau backfill data yang dilakukan di sini.
     *
     * PERUBAHAN SKEMA:
     *   1. Kolom data kependudukan sensitif diperluas ke VARCHAR(512) untuk
     *      menampung ciphertext AES-256-CBC dari Laravel Native Encrypted Cast.
     *   2. Kolom `alamat_lengkap` TIDAK diubah — tetap TEXT.
     *      Justifikasi: worst-case ciphertext AES-256-CBC untuk alamat >175 karakter
     *      menghasilkan output >512 karakter (kalkulasi verified). TEXT (65.535 byte)
     *      mempertahankan kapasitas yang aman tanpa risiko truncation.
     *   3. Kolom `nik_hash` dan `no_kk_hash` ditambahkan sebagai CHAR(64) UNIQUE.
     *
     * CATATAN POST-MIGRATION:
     *   - Kolom `nik_hash` dan `no_kk_hash` akan bernilai NULL segera setelah
     *     migration ini dijalankan. Ini adalah kondisi yang disengaja dan aman.
     *   - Proses backfill (pengisian nilai hash) merupakan tanggung jawab
     *     Task T9 (Seeders & Factories) sesuai roadmap implementasi ITB.
     *   - Migration ini tidak memengaruhi integritas data yang sudah ada.
     *
     * JUSTIFIKASI KAPASITAS VARCHAR(512):
     *   Format ciphertext Laravel: base64(JSON{ iv(24), value(base64_AES), mac(64), tag })
     *   - NIK (16 char plaintext)         → ~228 char ciphertext  → VARCHAR(512) AMAN
     *   - nomor_hp (maks 20 char)          → ~228 char ciphertext  → VARCHAR(512) AMAN
     *   - tempat_lahir (maks ~100 char)    → ~372 char ciphertext  → VARCHAR(512) AMAN
     *   - no_kk (16 char plaintext)        → ~228 char ciphertext  → VARCHAR(512) AMAN
     *   - alamat_lengkap (maks ~200+ char) → ~568 char ciphertext  → TEXT DIPILIH
     *
     * DEPENDENCY:
     *   Laravel Framework 10.50.2 mendukung native column modification via
     *   `->change()` pada MySQL 8.0 tanpa membutuhkan `doctrine/dbal`.
     *   (Fitur native ALTER tersedia sejak laravel/framework >= 10.20.0)
     *
     * ASUMSI MYSQL 8.0:
     *   - Modifikasi kolom PRIMARY KEY (`nik`, `no_kk`) via MODIFY COLUMN aman
     *     pada InnoDB karena PRIMARY KEY adalah table-level constraint, bukan
     *     column-level attribute; constraint tetap utuh setelah MODIFY.
     *   - Kolom `no_kk` di `kartu_keluargas` direferensikan sebagai FOREIGN KEY
     *     oleh `anggota_keluargas.no_kk`. Pada eksekusi di MySQL 8.0, disarankan
     *     menonaktifkan FOREIGN_KEY_CHECKS sementara selama migration berlangsung,
     *     atau memastikan driver MySQL sudah mendukung implicit FK constraint update.
     *
     * @see app/Services/Security/IdentityHashService.php  (T1 — Architecture Frozen)
     * @see SCD IdentityHashService v1.1                   (C-02, C-08, C-09, C-10)
     * @see CTM v2.0                                        (Mapping T2 → C-02, C-08)
     * @see ADR-001                                         (Domain Separation & Key)
     * @see ITB Task T2                                     (Security Hardening Phase 1)
     */
    public function up(): void
    {
        // ---------------------------------------------------------------------
        // Tabel: anggota_keluargas
        // Operasi: Perluas kolom sensitif + tambahkan kolom lookup hash
        // ---------------------------------------------------------------------
        Schema::table('anggota_keluargas', function (Blueprint $table) {
            // Perluas kapasitas kolom NIK untuk menampung ciphertext AES-256-CBC.
            $table->string('nik', 512)->change();

            // Perluas kapasitas kolom nomor_hp untuk ciphertext AES-256-CBC.
            $table->string('nomor_hp', 512)->nullable()->change();

            // Perluas kapasitas kolom tempat_lahir untuk ciphertext AES-256-CBC.
            $table->string('tempat_lahir', 512)->change();

            // Tambahkan kolom deterministic lookup index berbasis HMAC-SHA256.
            // Diisi oleh IdentityHashService::hashNik() via Model booted() observer (Task T4).
            // Index diberi nama eksplisit `udx_nik_hash` untuk kemudahan identifikasi
            // di level database tanpa bergantung pada nama auto-generated Laravel.
            // CATATAN: Nilai NULL setelah migration. Backfill dilakukan pada Task T9.
            $table->char('nik_hash', 64)->nullable()->unique('udx_nik_hash')->after('nik');
        });

        // ---------------------------------------------------------------------
        // Tabel: kartu_keluargas
        // Operasi: Perluas kolom sensitif + tambahkan kolom lookup hash
        // CATATAN: `alamat_lengkap` (TEXT) tidak diubah — lihat justifikasi PHPDoc.
        // ---------------------------------------------------------------------
        Schema::table('kartu_keluargas', function (Blueprint $table) {
            // Perluas kapasitas kolom no_kk untuk menampung ciphertext AES-256-CBC.
            $table->string('no_kk', 512)->change();

            // Tambahkan kolom deterministic lookup index berbasis HMAC-SHA256.
            // Diisi oleh IdentityHashService::hashNoKk() via Model booted() observer (Task T4).
            // Index diberi nama eksplisit `udx_no_kk_hash` untuk kemudahan identifikasi
            // di level database tanpa bergantung pada nama auto-generated Laravel.
            // CATATAN: Nilai NULL setelah migration. Backfill dilakukan pada Task T9.
            $table->char('no_kk_hash', 64)->nullable()->unique('udx_no_kk_hash')->after('no_kk');
        });
    }

    /**
     * Reverse the migrations.
     *
     * PERINGATAN: Rollback ini aman hanya apabila dijalankan SEBELUM proses
     * enkripsi data (Task T4) dilakukan. Rollback pada database yang sudah
     * berisi ciphertext (~200-500 char) akan menyebabkan truncation / data loss
     * saat kolom dikembalikan ke VARCHAR(16) atau VARCHAR(20).
     *
     * STRATEGI ROLLBACK (2 tahap per tabel):
     *   Tahap 1 — Hapus kolom lookup hash dan index-nya.
     *   Tahap 2 — Kembalikan kapasitas kolom sensitif ke ukuran baseline.
     *   Pemisahan ke dua Schema::table() call yang berbeda memastikan setiap
     *   tahap menghasilkan ALTER TABLE statement yang independen dan terisolasi.
     */
    public function down(): void
    {
        // ---------------------------------------------------------------------
        // Tabel: anggota_keluargas
        // Tahap 1: Hapus kolom lookup hash + unique index-nya
        // ---------------------------------------------------------------------
        Schema::table('anggota_keluargas', function (Blueprint $table) {
            $table->dropUnique('udx_nik_hash');
            $table->dropColumn('nik_hash');
        });

        // Tahap 2: Kembalikan kapasitas kolom sensitif ke ukuran baseline semula
        Schema::table('anggota_keluargas', function (Blueprint $table) {
            $table->string('nik', 16)->change();
            $table->string('nomor_hp', 20)->nullable()->change();
            $table->string('tempat_lahir', 255)->change();
        });

        // ---------------------------------------------------------------------
        // Tabel: kartu_keluargas
        // Tahap 1: Hapus kolom lookup hash + unique index-nya
        // ---------------------------------------------------------------------
        Schema::table('kartu_keluargas', function (Blueprint $table) {
            $table->dropUnique('udx_no_kk_hash');
            $table->dropColumn('no_kk_hash');
        });

        // Tahap 2: Kembalikan kapasitas kolom no_kk ke ukuran baseline semula
        // CATATAN: `alamat_lengkap` tidak perlu dikembalikan karena tidak diubah pada up().
        Schema::table('kartu_keluargas', function (Blueprint $table) {
            $table->string('no_kk', 16)->change();
        });
    }
};
