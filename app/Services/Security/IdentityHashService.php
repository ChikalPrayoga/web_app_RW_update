<?php

namespace App\Services\Security;

/**
 * IdentityHashService
 *
 * Menyediakan Single Source of Truth untuk pengkodean deterministic lookup hash
 * berbasis HMAC-SHA256 menggunakan APP_KEY sebagai pepper key.
 *
 * Digunakan untuk membuat kolom `nik_hash` dan `no_kk_hash` yang memungkinkan
 * exact-match database lookup pada data yang telah terenkripsi (AES-256-CBC).
 *
 * PENTING: Hash yang dihasilkan bersifat DETERMINISTIC — input yang sama
 * selalu menghasilkan output yang sama selama APP_KEY tidak berubah.
 * Hash ini BUKAN enkripsi dan tidak bisa dibalik menjadi plaintext.
 *
 * @see Engineering Plan (Fase 1 - Security Hardening)
 * @see APV Report (Architecture Prototype Validation)
 */
class IdentityHashService
{
    /**
     * Menghasilkan deterministic HMAC-SHA256 lookup hash untuk kolom NIK.
     *
     * Hash ini digunakan sebagai nilai kolom `nik_hash` pada tabel
     * `anggota_keluargas` untuk mendukung exact-match query pada NIK
     * yang tersimpan dalam format ciphertext terenkripsi.
     *
     * @param  string|null  $nik  NIK 16-digit dalam format plaintext.
     * @return string|null        64-character hex string HMAC-SHA256, atau null jika input kosong.
     */
    public static function hashNik(?string $nik): ?string
    {
        if (empty($nik)) {
            return null;
        }

        return hash_hmac('sha256', 'nik:' . trim($nik), config('app.key'));
    }

    /**
     * Menghasilkan deterministic HMAC-SHA256 lookup hash untuk kolom No KK.
     *
     * Hash ini digunakan sebagai nilai kolom `no_kk_hash` pada tabel
     * `kartu_keluargas` untuk mendukung exact-match query pada No KK
     * yang tersimpan dalam format ciphertext terenkripsi.
     *
     * @param  string|null  $noKk  Nomor KK 16-digit dalam format plaintext.
     * @return string|null         64-character hex string HMAC-SHA256, atau null jika input kosong.
     */
    public static function hashNoKk(?string $noKk): ?string
    {
        if (empty($noKk)) {
            return null;
        }

        return hash_hmac('sha256', 'kk:' . trim($noKk), config('app.key'));
    }
}
