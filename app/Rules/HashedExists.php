<?php

namespace App\Rules;

use App\Services\Security\IdentityHashService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * HashedExists Validation Rule
 *
 * Custom Validation Rule Laravel 10 untuk memvalidasi keberadaan data kependudukan
 * (NIK / No KK) di database menggunakan deterministic lookup hash (HMAC-SHA256).
 *
 * Rule ini menggantikan `exists:anggota_keluargas,nik` dan `exists:kartu_keluargas,no_kk`
 * pada Form Request layer (Task T6) agar validasi berjalan terhadap kolom index
 * `nik_hash` dan `no_kk_hash` tanpa mengeksekusi pencarian pada ciphertext terenkripsi.
 *
 * @see IdentityHashService
 * @see SCD IdentityHashService v1.1 (C-01, C-02, C-04, C-05, C-06, C-09, C-10)
 * @see CTM v2.0
 * @see ADR-001
 * @see ITB Task T5
 */
class HashedExists implements ValidationRule
{
    /**
     * Nama tabel database target (misal: 'anggota_keluargas' atau 'kartu_keluargas').
     */
    protected string $table;

    /**
     * Nama kolom hash pencarian (misal: 'nik_hash' atau 'no_kk_hash').
     */
    protected string $column;

    /**
     * Tipe domain hashing ('nik' atau 'kk' / 'no_kk').
     */
    protected string $domainType;

    /**
     * Pesan kesalahan kustom opsional.
     */
    protected ?string $customMessage;

    /**
     * Create a new rule instance.
     *
     * @param  string  $table  Nama tabel database
     * @param  string  $column  Nama kolom hash pencarian
     * @param  string  $domainType  Tipe domain hashing ('nik' atau 'kk' / 'no_kk')
     * @param  string|null  $customMessage  Pesan kesalahan kustom
     */
    public function __construct(string $table, string $column, string $domainType, ?string $customMessage = null)
    {
        $this->table = $table;
        $this->column = $column;
        $this->domainType = strtolower(trim($domainType));
        $this->customMessage = $customMessage;

        if (!in_array($this->domainType, ['nik', 'kk', 'no_kk'], true)) {
            throw new InvalidArgumentException("Domain type harus berupa 'nik' atau 'kk'/'no_kk'.");
        }
    }

    /**
     * Factory method helper untuk validasi NIK pada tabel `anggota_keluargas`.
     *
     * @param  string|null  $customMessage
     * @return static
     */
    public static function nik(?string $customMessage = null): static
    {
        return new static('anggota_keluargas', 'nik_hash', 'nik', $customMessage);
    }

    /**
     * Factory method helper untuk validasi No KK pada tabel `kartu_keluargas`.
     *
     * @param  string|null  $customMessage
     * @return static
     */
    public static function noKk(?string $customMessage = null): static
    {
        return new static('kartu_keluargas', 'no_kk_hash', 'kk', $customMessage);
    }

    /**
     * Run the validation rule.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     * @return void
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 1. Abaikan value null atau string kosong — biarkan rule `required` yang menangani jika wajib diisi
        if ($value === null || $value === '') {
            return;
        }

        // 2. Tangani input non-scalar (array/object) secara aman
        if (!is_scalar($value)) {
            $fail($this->getMessage($attribute, 'Format input tidak valid.'));
            return;
        }

        $stringValue = (string) $value;

        // 3. Panggil IdentityHashService sebagai SINGLE SOURCE OF TRUTH (C-09 & C-01)
        $hashValue = match ($this->domainType) {
            'nik' => IdentityHashService::hashNik($stringValue),
            'kk', 'no_kk' => IdentityHashService::hashNoKk($stringValue),
        };

        if ($hashValue === null) {
            $fail($this->getMessage($attribute, 'Gagal memproses validasi identitas.'));
            return;
        }

        // 4. Eksekusi query keberadaan data pada DB (memperhitungkan SoftDeletes `deleted_at`)
        $exists = DB::table($this->table)
            ->where($this->column, $hashValue)
            ->whereNull('deleted_at')
            ->exists();

        if (!$exists) {
            $fail($this->getMessage($attribute));
        }
    }

    /**
     * Dapatkan pesan kesalahan validasi.
     *
     * @param  string  $attribute
     * @param  string|null  $fallback
     * @return string
     */
    protected function getMessage(string $attribute, ?string $fallback = null): string
    {
        if ($fallback !== null) {
            return $fallback;
        }

        if ($this->customMessage !== null) {
            return $this->customMessage;
        }

        $label = match ($this->domainType) {
            'nik' => 'NIK',
            'kk', 'no_kk' => 'Nomor KK',
            default => 'Data identitas',
        };

        return "Data {$label} yang dimasukkan tidak ditemukan dalam sistem.";
    }
}
