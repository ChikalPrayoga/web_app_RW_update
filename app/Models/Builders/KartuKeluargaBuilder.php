<?php

namespace App\Models\Builders;

use App\Services\Security\IdentityHashService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Expression;

/**
 * KartuKeluargaBuilder
 *
 * Custom Eloquent Query Builder untuk model KartuKeluarga.
 * Meng-intercept query pencarian berbasis `no_kk` secara transparan
 * dan mengalihkan pencarian ke kolom deterministic lookup hash `no_kk_hash`.
 *
 * Sesuai arsitektur Security Hardening Phase 1, builder ini memproteksi
 * modul keuangan yang terkunci (ContributionService.php [FROZEN & LOCKED])
 * agar kueri `KartuKeluarga::where('no_kk', $val)` tetap menemukan data
 * terenkripsi tanpa perlu mengubah satu baris pun pada ContributionService.php.
 *
 * @see IdentityHashService
 * @see SCD IdentityHashService v1.1 (C-01, C-03, C-04, C-05, C-06, C-09, C-10)
 * @see CTM v2.0
 * @see ADR-001
 * @see ITB Task T3
 */
class KartuKeluargaBuilder extends Builder
{
    /**
     * Map nama kolom target ke kolom hash pencariannya.
     *
     * @var array<string, string>
     */
    protected const HASH_COLUMN_MAP = [
        'no_kk' => 'no_kk_hash',
        'kartu_keluargas.no_kk' => 'kartu_keluargas.no_kk_hash',
    ];

    /**
     * Intercept basic where clause untuk mengalihkan pencarian `no_kk` ke `no_kk_hash`.
     *
     * @param  mixed  $column
     * @param  mixed  $operator
     * @param  mixed  $value
     * @param  string  $boolean
     * @return $this
     */
    public function where($column, $operator = null, $value = null, $boolean = 'and')
    {
        // 1. Tangani query berbasis array: where(['no_kk' => '3271...', 'rt_code' => '001'])
        if (is_array($column)) {
            $transformed = [];
            foreach ($column as $key => $val) {
                $lowerKey = is_string($key) ? strtolower(trim($key)) : $key;
                if (is_string($key) && isset(self::HASH_COLUMN_MAP[$lowerKey])) {
                    $hashCol = self::HASH_COLUMN_MAP[$lowerKey];
                    $strVal = is_scalar($val) ? (string) $val : $val;
                    $transformed[$hashCol] = IdentityHashService::hashNoKk($strVal);
                } else {
                    $transformed[$key] = $val;
                }
            }
            return parent::where($transformed, $operator, $value, $boolean);
        }

        // 2. Tangani query berbasis string kolom: where('no_kk', '3271...') atau where('kartu_keluargas.no_kk', '=', '3271...')
        if (is_string($column) && !($column instanceof Expression)) {
            $lowerColumn = strtolower(trim($column));

            if (isset(self::HASH_COLUMN_MAP[$lowerColumn])) {
                $targetHashColumn = self::HASH_COLUMN_MAP[$lowerColumn];

                // Normalisasi jika 2 argumen diberikan: where('no_kk', $val)
                if (func_num_args() === 2) {
                    $value = $operator;
                    $operator = '=';
                }

                // Intercept operator equality & inequality ('=', '==', '!=', '<>')
                if (in_array($operator, ['=', '==', '!=', '<>'], true)) {
                    $strVal = is_scalar($value) ? (string) $value : $value;
                    $hashedValue = IdentityHashService::hashNoKk($strVal);
                    return parent::where($targetHashColumn, $operator, $hashedValue, $boolean);
                }
            }
        }

        return parent::where($column, $operator, $value, $boolean);
    }

    /**
     * Intercept "where in" clause untuk mengalihkan pencarian `no_kk` ke `no_kk_hash`.
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
                        $hashedValues[] = IdentityHashService::hashNoKk($strVal);
                    }
                }

                return parent::whereIn($targetHashColumn, $hashedValues, $boolean, $not);
            }
        }

        return parent::whereIn($column, $values, $boolean, $not);
    }

    /**
     * Intercept "where null" clause untuk mengalihkan klausa dari `no_kk` ke `no_kk_hash`.
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
