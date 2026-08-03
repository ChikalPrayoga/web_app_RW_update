# Referensi Migration Database — SIM RW 047

> Dokumen ini dibuat secara otomatis berdasarkan file migration Laravel yang terdapat pada repository.
> Tanggal pembuatan: **4 Juli 2026**

---

## Daftar Isi

1. [Tabel: users](#tabel-users)
2. [Tabel: kartu_keluargas](#tabel-kartu_keluargas)
3. [Tabel: warga (anggota_keluargas)](#tabel-warga-anggota_keluargas)
4. [Tabel: pengajuan_surats](#tabel-pengajuan_surats)
5. [Tabel: log_laporan_aspirasis](#tabel-log_laporan_aspirasis)
6. [Ringkasan](#ringkasan)

---

## Tabel: users

### Informasi Umum

| Properti           | Nilai                                        |
| ------------------ | -------------------------------------------- |
| Nama tabel         | `users`                                      |
| Nama file migration | `2014_10_12_000000_create_users_table.php`   |
| Tanggal migration  | 12 Oktober 2014                              |

### Struktur Kolom

| Kolom              | Tipe Data               | Nullable | Default    | Keterangan                                                                 |
| ------------------ | ------------------------ | -------- | ---------- | -------------------------------------------------------------------------- |
| `user_id`          | `BIGINT UNSIGNED` (AI)   | Tidak    | Auto Increment | Primary key, menggunakan `$table->id('user_id')`                        |
| `role_id`          | `BIGINT UNSIGNED`        | Ya       | `NULL`     | Foreign key ke tabel `roles`                                              |
| `username`         | `VARCHAR(255)`           | Tidak    | —          | Unique constraint                                                          |
| `email`            | `VARCHAR(255)`           | Tidak    | —          | Unique constraint                                                          |
| `email_verified_at`| `TIMESTAMP`              | Ya       | `NULL`     | Waktu verifikasi email                                                     |
| `password`         | `VARCHAR(255)`           | Tidak    | —          | Hash password (komentar di migration: "mapped to password_hash implicitly in Laravel") |
| `full_name`        | `VARCHAR(255)`           | Tidak    | —          | Nama lengkap pengguna                                                      |
| `phone_number`     | `VARCHAR(255)`           | Ya       | `NULL`     | Nomor telepon                                                              |
| `status`           | `ENUM('ACTIVE','INACTIVE')` | Tidak | `'ACTIVE'` | Status akun pengguna                                                       |
| `last_login_at`    | `TIMESTAMP`              | Ya       | `NULL`     | Waktu login terakhir                                                       |
| `remember_token`   | `VARCHAR(100)`           | Ya       | `NULL`     | Token "remember me" (Laravel `rememberToken()`)                            |
| `created_at`       | `TIMESTAMP`              | Ya       | `NULL`     | Otomatis dari `$table->timestamps()`                                       |
| `updated_at`       | `TIMESTAMP`              | Ya       | `NULL`     | Otomatis dari `$table->timestamps()`                                       |
| `deleted_at`       | `TIMESTAMP`              | Ya       | `NULL`     | Soft delete, dari `$table->softDeletes()`                                  |

### Primary Key

| Kolom     | Tipe                          |
| --------- | ----------------------------- |
| `user_id` | `BIGINT UNSIGNED` Auto Increment |

### Foreign Key

| Kolom     | Referensi Tabel | Referensi Kolom | onUpdate       | onDelete    |
| --------- | --------------- | --------------- | -------------- | ----------- |
| `role_id` | `roles`         | `role_id`       | Tidak didefinisikan (default: `RESTRICT`) | `SET NULL`  |

> Foreign key dibuat melalui `$table->foreignId('role_id')->nullable()->constrained('roles', 'role_id')->onDelete('set null')`.

### Index

| Kolom      | Tipe Index |
| ---------- | ---------- |
| `username` | `UNIQUE`   |
| `email`    | `UNIQUE`   |

### Constraint

- Kolom `status` menggunakan `ENUM` dengan nilai terbatas: `ACTIVE`, `INACTIVE`.
- Soft delete diaktifkan melalui `softDeletes()`.

### Catatan

Tabel `users` menyimpan data akun pengguna sistem. Setiap user memiliki satu role (opsional) yang ditentukan melalui foreign key `role_id` ke tabel `roles`. Tabel ini mendukung soft delete dan mencatat waktu login terakhir.

---

## Tabel: kartu_keluargas

### Informasi Umum

| Properti           | Nilai                                                |
| ------------------ | ---------------------------------------------------- |
| Nama tabel         | `kartu_keluargas`                                    |
| Nama file migration | `2026_06_10_062643_create_kartu_keluargas_table.php` |
| Tanggal migration  | 10 Juni 2026                                         |

### Struktur Kolom

| Kolom                        | Tipe Data       | Nullable | Default | Keterangan                                    |
| ---------------------------- | --------------- | -------- | ------- | --------------------------------------------- |
| `no_kk`                      | `VARCHAR(16)`   | Tidak    | —       | Primary key, Nomor Kartu Keluarga (16 digit)  |
| `rt_code`                    | `VARCHAR(5)`    | Tidak    | —       | Kode RT                                       |
| `alamat_lengkap`             | `TEXT`          | Tidak    | —       | Alamat lengkap keluarga                       |
| `blok`                       | `VARCHAR(10)`   | Ya       | `NULL`  | Blok perumahan                                |
| `nomor_rumah`                | `VARCHAR(10)`   | Ya       | `NULL`  | Nomor rumah                                   |
| `status_kepemilikan_rumah`   | `VARCHAR(50)`   | Ya       | `NULL`  | Status kepemilikan rumah                      |
| `created_at`                 | `TIMESTAMP`     | Ya       | `NULL`  | Otomatis dari `$table->timestamps()`          |
| `updated_at`                 | `TIMESTAMP`     | Ya       | `NULL`  | Otomatis dari `$table->timestamps()`          |
| `deleted_at`                 | `TIMESTAMP`     | Ya       | `NULL`  | Soft delete, dari `$table->softDeletes()`     |

### Primary Key

| Kolom   | Tipe          |
| ------- | ------------- |
| `no_kk` | `VARCHAR(16)` |

> Primary key bukan auto-increment, menggunakan Nomor Kartu Keluarga sebagai natural key.

### Foreign Key

Tidak ada foreign key yang didefinisikan pada migration ini.

### Index

Tidak ada index tambahan selain primary key.

### Constraint

- Soft delete diaktifkan melalui `softDeletes()`.

### Catatan

Tabel `kartu_keluargas` menyimpan data Kartu Keluarga (KK). Menggunakan `no_kk` (Nomor KK 16 digit) sebagai primary key natural. Tabel ini menyimpan informasi alamat dan lokasi rumah (blok, nomor rumah, status kepemilikan). Kolom `rt_code` mengindikasikan tabel ini terkait dengan struktur wilayah RT, meskipun tidak ada foreign key eksplisit ke tabel RT pada migration ini.

---

## Tabel: warga (anggota_keluargas)

> **Catatan:** Migration dengan nama tabel `warga` tidak ditemukan pada repository.
> Tabel yang merepresentasikan data warga pada sistem ini adalah `anggota_keluargas`.
> Dokumentasi berikut berdasarkan migration tabel `anggota_keluargas`.

### Informasi Umum

| Properti           | Nilai                                                     |
| ------------------ | --------------------------------------------------------- |
| Nama tabel         | `anggota_keluargas`                                       |
| Nama file migration | `2026_06_10_062644_create_anggota_keluargas_table.php`   |
| Tanggal migration  | 10 Juni 2026                                              |

### Struktur Kolom

| Kolom                         | Tipe Data          | Nullable | Default   | Keterangan                                           |
| ----------------------------- | ------------------ | -------- | --------- | ---------------------------------------------------- |
| `nik`                         | `VARCHAR(16)`      | Tidak    | —         | Primary key, Nomor Induk Kependudukan (16 digit)     |
| `no_kk`                       | `VARCHAR(16)`      | Tidak    | —         | Foreign key ke tabel `kartu_keluargas`               |
| `nama_lengkap`                | `VARCHAR(255)`     | Tidak    | —         | Nama lengkap warga                                   |
| `jenis_kelamin`               | `ENUM('L','P')`    | Tidak    | —         | Jenis kelamin: L (Laki-laki), P (Perempuan)          |
| `tempat_lahir`                | `VARCHAR(255)`     | Tidak    | —         | Tempat lahir                                         |
| `tanggal_lahir`               | `DATE`             | Tidak    | —         | Tanggal lahir                                        |
| `pekerjaan`                   | `VARCHAR(255)`     | Ya       | `NULL`    | Pekerjaan warga                                      |
| `nomor_hp`                    | `VARCHAR(20)`      | Ya       | `NULL`    | Nomor HP / telepon                                   |
| `status_hubungan_keluarga`    | `VARCHAR(50)`      | Tidak    | —         | Status hubungan dalam keluarga (misal: Kepala Keluarga, Istri, Anak) |
| `status_sosio_ekonomi`        | `VARCHAR(50)`      | Ya       | `NULL`    | Status sosio-ekonomi warga                           |
| `status_warga`                | `VARCHAR(50)`      | Tidak    | `'AKTIF'` | Status kependudukan warga                            |
| `created_at`                  | `TIMESTAMP`        | Ya       | `NULL`    | Otomatis dari `$table->timestamps()`                 |
| `updated_at`                  | `TIMESTAMP`        | Ya       | `NULL`    | Otomatis dari `$table->timestamps()`                 |
| `deleted_at`                  | `TIMESTAMP`        | Ya       | `NULL`    | Soft delete, dari `$table->softDeletes()`            |

### Primary Key

| Kolom | Tipe          |
| ----- | ------------- |
| `nik` | `VARCHAR(16)` |

> Primary key bukan auto-increment, menggunakan NIK sebagai natural key.

### Foreign Key

| Kolom   | Referensi Tabel   | Referensi Kolom | onUpdate       | onDelete  |
| ------- | ----------------- | --------------- | -------------- | --------- |
| `no_kk` | `kartu_keluargas` | `no_kk`         | Tidak didefinisikan (default: `RESTRICT`) | `CASCADE` |

> Foreign key dibuat melalui `$table->foreign('no_kk')->references('no_kk')->on('kartu_keluargas')->onDelete('cascade')`.

### Index

Tidak ada index tambahan selain primary key.

### Constraint

- Kolom `jenis_kelamin` menggunakan `ENUM` dengan nilai terbatas: `L`, `P`.
- Soft delete diaktifkan melalui `softDeletes()`.

### Catatan

Tabel `anggota_keluargas` menyimpan data individu warga yang merupakan anggota dari suatu Kartu Keluarga. Menggunakan `nik` (NIK 16 digit) sebagai primary key natural dan berelasi dengan tabel `kartu_keluargas` melalui `no_kk`. Jika data KK dihapus, seluruh anggota keluarga terkait akan ikut terhapus (cascade). Tabel ini merupakan representasi data "warga" dalam sistem.

---

## Tabel: pengajuan_surats

### Informasi Umum

| Properti           | Nilai                                                    |
| ------------------ | -------------------------------------------------------- |
| Nama tabel         | `pengajuan_surats`                                       |
| Nama file migration | `2026_06_11_184552_create_pengajuan_surats_table.php`   |
| Tanggal migration  | 11 Juni 2026                                             |

### Struktur Kolom

| Kolom              | Tipe Data              | Nullable | Default       | Keterangan                                       |
| ------------------ | ---------------------- | -------- | ------------- | ------------------------------------------------ |
| `pengajuan_id`     | `BIGINT UNSIGNED` (AI) | Tidak    | Auto Increment | Primary key                                      |
| `nik`              | `VARCHAR(16)`          | Tidak    | —             | Foreign key ke tabel `anggota_keluargas`         |
| `nomor_surat`      | `VARCHAR(100)`         | Ya       | `NULL`        | Nomor surat (diisi setelah surat diproses)       |
| `jenis_surat`      | `VARCHAR(50)`          | Tidak    | —             | Jenis surat yang diajukan                        |
| `keperluan`        | `TEXT`                 | Tidak    | —             | Keperluan pengajuan surat                        |
| `current_status`   | `VARCHAR(50)`          | Tidak    | `'SUBMITTED'` | Status pengajuan saat ini                        |
| `tanggal_pengajuan`| `TIMESTAMP`            | Tidak    | `CURRENT_TIMESTAMP` | Tanggal pengajuan dibuat, otomatis `useCurrent()` |
| `tanggal_selesai`  | `TIMESTAMP`            | Ya       | `NULL`        | Tanggal pengajuan selesai diproses               |
| `created_at`       | `TIMESTAMP`            | Ya       | `NULL`        | Otomatis dari `$table->timestamps()`             |
| `updated_at`       | `TIMESTAMP`            | Ya       | `NULL`        | Otomatis dari `$table->timestamps()`             |
| `deleted_at`       | `TIMESTAMP`            | Ya       | `NULL`        | Soft delete, dari `$table->softDeletes()`        |

### Primary Key

| Kolom          | Tipe                          |
| -------------- | ----------------------------- |
| `pengajuan_id` | `BIGINT UNSIGNED` Auto Increment |

### Foreign Key

| Kolom | Referensi Tabel     | Referensi Kolom | onUpdate       | onDelete  |
| ----- | ------------------- | --------------- | -------------- | --------- |
| `nik` | `anggota_keluargas` | `nik`           | Tidak didefinisikan (default: `RESTRICT`) | `CASCADE` |

> Foreign key dibuat melalui `$table->foreign('nik')->references('nik')->on('anggota_keluargas')->onDelete('cascade')`.

### Index

Tidak ada index tambahan selain primary key.

### Constraint

- Soft delete diaktifkan melalui `softDeletes()`.

### Catatan

Tabel `pengajuan_surats` menyimpan data pengajuan surat oleh warga. Setiap pengajuan terkait dengan satu warga melalui `nik`. Kolom `nomor_surat` bersifat nullable karena nomor surat kemungkinan diberikan setelah pengajuan diproses. Kolom `current_status` dengan default `SUBMITTED` mengindikasikan adanya alur status (workflow) pada pengajuan surat. Kolom `tanggal_pengajuan` otomatis diisi waktu saat record dibuat.

---

## Tabel: log_laporan_aspirasis

### Informasi Umum

| Properti           | Nilai                                                          |
| ------------------ | -------------------------------------------------------------- |
| Nama tabel         | `log_laporan_aspirasis`                                        |
| Nama file migration | `2026_06_10_085707_create_log_laporan_aspirasis_table.php`    |
| Tanggal migration  | 10 Juni 2026                                                   |

### Struktur Kolom

| Kolom            | Tipe Data              | Nullable | Default            | Keterangan                                          |
| ---------------- | ---------------------- | -------- | ------------------ | --------------------------------------------------- |
| `aspirasi_id`    | `BIGINT UNSIGNED` (AI) | Tidak    | Auto Increment     | Primary key                                         |
| `nik`            | `VARCHAR(16)`          | Tidak    | —                  | Foreign key ke tabel `anggota_keluargas`            |
| `kanal_laporan`  | `VARCHAR(50)`          | Tidak    | `'WEB'`            | Kanal pelaporan (default: WEB)                      |
| `teks_keluhan`   | `TEXT`                 | Tidak    | —                  | Isi teks keluhan/aspirasi                           |
| `ai_category`    | `VARCHAR(50)`          | Ya       | `NULL`             | Kategori hasil analisis AI                          |
| `ai_priority`    | `VARCHAR(50)`          | Ya       | `NULL`             | Prioritas hasil analisis AI                         |
| `ai_summary`     | `TEXT`                 | Ya       | `NULL`             | Ringkasan hasil analisis AI                         |
| `ai_confidence`  | `DECIMAL(5,2)`         | Ya       | `NULL`             | Tingkat kepercayaan AI (0.00–999.99)                |
| `current_status` | `VARCHAR(50)`          | Tidak    | `'SUBMITTED'`      | Status laporan saat ini                             |
| `submitted_at`   | `TIMESTAMP`            | Tidak    | `CURRENT_TIMESTAMP`| Waktu laporan diajukan, otomatis `useCurrent()`     |
| `resolved_at`    | `TIMESTAMP`            | Ya       | `NULL`             | Waktu laporan diselesaikan                          |
| `created_at`     | `TIMESTAMP`            | Ya       | `NULL`             | Otomatis dari `$table->timestamps()`                |
| `updated_at`     | `TIMESTAMP`            | Ya       | `NULL`             | Otomatis dari `$table->timestamps()`                |
| `deleted_at`     | `TIMESTAMP`            | Ya       | `NULL`             | Soft delete, dari `$table->softDeletes()`           |

### Primary Key

| Kolom         | Tipe                          |
| ------------- | ----------------------------- |
| `aspirasi_id` | `BIGINT UNSIGNED` Auto Increment |

### Foreign Key

| Kolom | Referensi Tabel     | Referensi Kolom | onUpdate       | onDelete  |
| ----- | ------------------- | --------------- | -------------- | --------- |
| `nik` | `anggota_keluargas` | `nik`           | Tidak didefinisikan (default: `RESTRICT`) | `CASCADE` |

> Foreign key dibuat melalui `$table->foreign('nik')->references('nik')->on('anggota_keluargas')->onDelete('cascade')`.

### Index

Tidak ada index tambahan selain primary key.

### Constraint

- Soft delete diaktifkan melalui `softDeletes()`.

### Catatan

Tabel `log_laporan_aspirasis` menyimpan data laporan aspirasi/keluhan warga. Setiap laporan terkait dengan satu warga melalui `nik`. Tabel ini memiliki kolom-kolom khusus untuk menyimpan hasil analisis AI (`ai_category`, `ai_priority`, `ai_summary`, `ai_confidence`) yang semuanya bersifat nullable, mengindikasikan bahwa analisis AI bersifat opsional atau dilakukan secara asinkron setelah laporan diajukan. Kolom `kanal_laporan` dengan default `WEB` menunjukkan bahwa laporan dapat datang dari berbagai kanal. Kolom `current_status` dengan default `SUBMITTED` mengindikasikan adanya alur status (workflow) pada penanganan laporan.

---

## Ringkasan

### Migration yang Berhasil Ditemukan

| No | Tabel yang Diminta     | Tabel pada Migration    | File Migration                                              | Status       |
| -- | ---------------------- | ----------------------- | ----------------------------------------------------------- | ------------ |
| 1  | `users`                | `users`                 | `2014_10_12_000000_create_users_table.php`                  | ✅ Ditemukan |
| 2  | `kartu_keluarga`       | `kartu_keluargas`       | `2026_06_10_062643_create_kartu_keluargas_table.php`        | ✅ Ditemukan |
| 3  | `warga`                | `anggota_keluargas`     | `2026_06_10_062644_create_anggota_keluargas_table.php`      | ⚠️ Ditemukan sebagai `anggota_keluargas` |
| 4  | `pengajuan_surat`      | `pengajuan_surats`      | `2026_06_11_184552_create_pengajuan_surats_table.php`       | ✅ Ditemukan |
| 5  | `laporan_aspirasi`     | `log_laporan_aspirasis` | `2026_06_10_085707_create_log_laporan_aspirasis_table.php`  | ✅ Ditemukan |

### Migration yang Tidak Ditemukan

- Tidak ada migration dengan nama tabel `warga` secara eksplisit. Data warga direpresentasikan oleh tabel `anggota_keluargas`.

### Jumlah Tabel yang Didokumentasikan

**5 dari 5 tabel** berhasil didokumentasikan.

### Lokasi File Dokumentasi

```
docs/database/MIGRATION_REFERENCE.md
```
