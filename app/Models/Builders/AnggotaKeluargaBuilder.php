<?php

namespace App\Models\Builders;

use App\Services\Security\IdentityHashService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Expression;

/**
 * AnggotaKeluargaBuilder
 *
 * Custom Eloquent Query Builder untuk model AnggotaKeluarga.
 * Meng-intercept query pencarian berbasis `nik` secara transparan
 * dan mengalihkan pencarian ke kolom deterministic lookup hash `nik_hash`.
 *
 * Sesuai arsitektur Security Hardening Phase 1, builder ini memungkinkan
 * seluruh Service, Repository, dan Controller layer menjalankan query
 * `AnggotaKeluarga::where('nik', $val)` secara transparan tanpa merusak
 * kueri pada data `nik` yang tersimpan dalam format ciphertext terenkripsi.
 *
 * @see IdentityHashService
 * @see SCD IdentityHashService v1.1 (C-01, C-03, C-04, C-05, C-06, C-09, C-10)
 * @see CTM v2.0
 * @see ADR-001
 * @see ITB Task T3
 */
class AnggotaKeluargaBuilder extends Builder
{
    /**
     * Map nama kolom target ke kolom hash pencariannya.
     *
     * @var array<string, string>
     */
    protected const HASH_COLUMN_MAP = [
        'nik' => 'nik_hash',
        'anggota_keluargas.nik' => 'anggota_keluargas.nik_hash',
    ];

    /**
     * Intercept basic where clause untuk mengalihkan pencarian `nik` ke `nik_hash`.
     *
     * @param  mixed  $column
     * @param  mixed  $operator
     * @param  mixed  $value
     * @param  string  $boolean
     * @return $this
     */
    public function where($column, $operator = null, $value = null, $boolean = 'and')
    {
        // 1. Tangani query berbasis array: where(['nik' => '3271...', 'status_warga' => 'AKTIF'])
        if (is_array($column)) {
            $transformed = [];
            foreach ($column as $key => $val) {
                $lowerKey = is_string($key) ? strtolower(trim($key)) : $key;
                if (is_string($key) && isset(self::HASH_COLUMN_MAP[$lowerKey])) {
                    $hashCol = self::HASH_COLUMN_MAP[$lowerKey];
                    $strVal = is_scalar($val) ? (string) $val : $val;
                    $transformed[$hashCol] = IdentityHashService::hashNik($strVal);
                } else {
                    $transformed[$key] = $val;
                }
            }
            return parent::where($transformed, $operator, $value, $boolean);
        }

        // 2. Tangani query berbasis string kolom: where('nik', '3271...') atau where('anggota_keluargas.nik', '=', '3271...')
        if (is_string($column) && !($column instanceof Expression)) {
            $lowerColumn = strtolower(trim($column));

            if (isset(self::HASH_COLUMN_MAP[$lowerColumn])) {
                $targetHashColumn = self::HASH_COLUMN_MAP[$lowerColumn];

                // Normalisasi jika 2 argumen diberikan: where('nik', $val)
                if (func_num_args() === 2) {
                    $value = $operator;
                    $operator = '=';
                }

                // Intercept operator equality & inequality ('=', '==', '!=', '<>')
                if (in_array($operator, ['=', '==', '!=', '<>'], true)) {
                    $strVal = is_scalar($value) ? (string) $value : $value;
                    $hashedValue = IdentityHashService::hashNik($strVal);
                    return parent::where($targetHashColumn, $operator, $hashedValue, $boolean);
                }
            }
        }

        return parent::where($column, $operator, $value, $boolean);
    }

    /**
     * Intercept "where in" clause untuk mengalihkan pencarian `nik` ke `nik_hash`.
     *
     * @param  string  $column
     * @param  mixed  $values
     * @param  string  $boolean
     * @param  bool  $not
     * @return $this
     */
    public function whereIn($column, $values, $boolean = 'and', $not = false)
    {
        if (is_string($column) && !($column instanceof Expression)) {
            $lowerColumn = strtolower(trim($column));

            if (isset(self::HASH_COLUMN_MAP[$lowerColumn])) {
                $targetHashColumn = self::HASH_COLUMN_MAP[$lowerColumn];

                $hashedValues = [];
                if (is_iterable($values)) {
                    foreach ($values as $val) {
                        $strVal = is_scalar($val) ? (string) $val : $val;
                        $hashedValues[] = IdentityHashService::hashNik($strVal);
                    }
                }

                return parent::whereIn($targetHashColumn, $hashedValues, $boolean, $not);
            }
        }

        return parent::whereIn($column, $values, $boolean, $not);
    }

    /**
     * Intercept "where null" clause untuk mengalihkan klausa dari `nik` ke `nik_hash`.
     *
     * @param  string|array  $columns
     * @param  string  $boolean
     * @param  bool  $not
     * @return $this
     */
    public function whereNull($columns, $boolean = 'and', $not = false)
    {
        if (is_string($columns)) {
            $lowerColumn = strtolower(trim($columns));
            if (isset(self::HASH_COLUMN_MAP[$lowerColumn])) {
                $columns = self::HASH_COLUMN_MAP[$lowerColumn];
            }
        } elseif (is_array($columns)) {
            $transformed = [];
            foreach ($columns as $col) {
                $lowerCol = is_string($col) ? strtolower(trim($col)) : $col;
                $transformed[] = is_string($col) && isset(self::HASH_COLUMN_MAP[$lowerCol])
                    ? self::HASH_COLUMN_MAP[$lowerCol]
                    : $col;
            }
            $columns = $transformed;
        }

        return parent::whereNull($columns, $boolean, $not);
    }
}
