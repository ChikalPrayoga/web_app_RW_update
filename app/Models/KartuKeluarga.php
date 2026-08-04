<?php

namespace App\Models;

use App\Models\Builders\KartuKeluargaBuilder;
use App\Services\Security\IdentityHashService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * KartuKeluarga Model
 *
 * Implementasi Security Hardening Phase 1 (Task T4):
 * - Native Encrypted Casts: `no_kk` dan `alamat_lengkap` tersimpan secara
 *   otomatis sebagai ciphertext AES-256-CBC di database MySQL.
 * - Booted Saving Observer: Mengisi `no_kk_hash` secara otomatis dengan
 *   HMAC-SHA256 digest dari `IdentityHashService::hashNoKk()` saat save.
 * - Custom Eloquent Builder: `KartuKeluargaBuilder` di-link via `newEloquentBuilder()`.
 *
 * @see KartuKeluargaBuilder
 * @see IdentityHashService
 * @see SCD IdentityHashService v1.1
 * @see CTM v2.0
 * @see ADR-001
 * @see ITB Task T4
 */
class KartuKeluarga extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'no_kk';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'no_kk',
        'rt_code',
        'alamat_lengkap',
        'blok',
        'nomor_rumah',
        'status_kepemilikan_rumah',
        'no_kk_hash',
    ];

    /**
     * The attributes that should be cast.
     *
     * Laravel Native Encrypted Casts menepis kerentanan pencurian database.
     * Data `no_kk` dan `alamat_lengkap` tersimpan sebagai ciphertext AES-256-CBC
     * dan secara otomatis didekripsi menjadi plaintext saat diakses di PHP application layer.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'no_kk' => 'encrypted',
        'alamat_lengkap' => 'encrypted',
    ];

    /**
     * Create a new Eloquent Query Builder for the model.
     *
     * Menghubungkan model KartuKeluarga ke KartuKeluargaBuilder (Read Path).
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @return KartuKeluargaBuilder
     */
    public function newEloquentBuilder($query)
    {
        return new KartuKeluargaBuilder($query);
    }

    /**
     * Boot the model and register saving event observer (Write Path).
     *
     * Memastikan kolom `no_kk_hash` selalu tersinkronisasi secara otomatis
     * dengan nilai HMAC-SHA256 dari `no_kk` setiap kali model dibuat atau diubah.
     */
    protected static function booted(): void
    {
        static::saving(function (KartuKeluarga $model) {
            if ($model->isDirty('no_kk') || empty($model->no_kk_hash)) {
                $model->no_kk_hash = IdentityHashService::hashNoKk($model->no_kk);
            }
        });
    }

    public function anggotaKeluargas()
    {
        return $this->hasMany(AnggotaKeluarga::class, 'no_kk', 'no_kk');
    }
}
