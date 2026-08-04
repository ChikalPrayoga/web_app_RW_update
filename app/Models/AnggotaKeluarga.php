<?php

namespace App\Models;

use App\Models\Builders\AnggotaKeluargaBuilder;
use App\Services\Security\IdentityHashService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * AnggotaKeluarga Model
 *
 * Implementasi Security Hardening Phase 1 (Task T4):
 * - Native Encrypted Casts: `nik`, `nomor_hp`, dan `tempat_lahir` tersimpan secara
 *   otomatis sebagai ciphertext AES-256-CBC di database MySQL.
 * - Booted Saving Observer: Mengisi `nik_hash` secara otomatis dengan
 *   HMAC-SHA256 digest dari `IdentityHashService::hashNik()` saat save.
 * - Custom Eloquent Builder: `AnggotaKeluargaBuilder` di-link via `newEloquentBuilder()`.
 *
 * @see AnggotaKeluargaBuilder
 * @see IdentityHashService
 * @see SCD IdentityHashService v1.1
 * @see CTM v2.0
 * @see ADR-001
 * @see ITB Task T4
 */
class AnggotaKeluarga extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'nik';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nik',
        'no_kk',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'pekerjaan',
        'nomor_hp',
        'status_hubungan_keluarga',
        'status_sosio_ekonomi',
        'status_warga',
        'nik_hash',
    ];

    /**
     * The attributes that should be cast.
     *
     * Laravel Native Encrypted Casts menepis kerentanan pencurian database.
     * Data `nik`, `nomor_hp`, dan `tempat_lahir` tersimpan sebagai ciphertext AES-256-CBC
     * dan secara otomatis didekripsi menjadi plaintext saat diakses di PHP application layer.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'nik' => 'encrypted',
        'nomor_hp' => 'encrypted',
        'tempat_lahir' => 'encrypted',
        'tanggal_lahir' => 'date',
    ];

    /**
     * Create a new Eloquent Query Builder for the model.
     *
     * Menghubungkan model AnggotaKeluarga ke AnggotaKeluargaBuilder (Read Path).
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @return AnggotaKeluargaBuilder
     */
    public function newEloquentBuilder($query)
    {
        return new AnggotaKeluargaBuilder($query);
    }

    /**
     * Boot the model and register saving event observer (Write Path).
     *
     * Memastikan kolom `nik_hash` selalu tersinkronisasi secara otomatis
     * dengan nilai HMAC-SHA256 dari `nik` setiap kali model dibuat atau diubah.
     */
    protected static function booted(): void
    {
        static::saving(function (AnggotaKeluarga $model) {
            if ($model->isDirty('nik') || empty($model->nik_hash)) {
                $model->nik_hash = IdentityHashService::hashNik($model->nik);
            }
        });
    }

    public function kartuKeluarga()
    {
        return $this->belongsTo(KartuKeluarga::class, 'no_kk', 'no_kk');
    }

    public function changeRequests()
    {
        return $this->hasMany(ResidentChangeRequest::class, 'nik', 'nik');
    }

    public function complaints()
    {
        return $this->hasMany(LogLaporanAspirasi::class, 'nik', 'nik');
    }
}
