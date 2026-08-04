# PROJECT CONTEXT & AGENT MEMORY - SIM RW 047 (VERSI 2)

Dokumen ini berisi memori konteks proyek, arsitektur, fitur yang ada, backlog, dan aturan pengodean (coding rules) yang **wajib dipatuhi oleh seluruh AI Agent** selama pengembangan Sistem Informasi Manajemen (SIM) RW 047.

---

## 1. Arsitektur Sistem & Stack Teknologi

### Stack Utama
* **Core Framework**: Laravel 10.x (PHP 8.1+) – mengelola Business Logic, Security, Authorization, Database Access, API Layer, dan Audit Trail.
* **Database**: MySQL 8.0 – **Single Source of Truth** (sumber data permanen utama).
* **Workflow Engine**: n8n – Orchestration engine untuk alur kerja AI dan background processing (tidak menyimpan data permanen).
* **AI Analysis Engine**: Google Gemini API – AI Enhancement layer untuk klasifikasi teks pengaduan, analisis urgensi, ekstraksi ringkasan, dan executive summary.
* **Notification System**: Telegram Bot API – Notifikasi publik dan pengaduan.
* **Frontend**: Laravel Blade + Tailwind CSS + Vite (Responsive, Mobile-First Design).

### Prinsip Arsitektur Utama
1. **Laravel as Core System**: Seluruh kontrol dan database mutation WAJIB melalui Laravel.
2. **MySQL as Source of Truth**: Data permanen hanya disimpan di MySQL. Gemini & n8n DILARANG menulis langsung ke database.
3. **AI Optional & Non-Blocking**: Fitur inti (Auth, Warga, Surat, Pengaduan, Keuangan) WAJIB tetap berjalan 100% meskipun n8n atau Gemini sedang down/luring.
4. **Human Review Principle**: AI hanya memberikan klasifikasi/rekomendasi. Keputusan bisnis (approval surat, usulan warga, penanganan pengaduan) tetap berada di tangan pengurus manusia (RT/RW).
5. **Failure Isolation**: Kegagalan API AI tidak boleh menghentikan transaksi HTTP/database pengguna (*graceful degradation* ke status fallback: Category `UNCATEGORIZED`, Urgency `Medium`).

---

## 2. Status Fitur yang Sudah Selesai (Completed Modules)

1. **Modul Autentikasi & RBAC**:
   - Multi-role hierarchy (Super Admin, Ketua RW, Sekretaris RW, Bendahara RW, Ketua RT, Warga).
   - Dynamic dashboard redirection berdasarkan jabatan organisasi aktif (`OrganizationalPosition`).
   - Matriks Peran & Permission (`roles`, `permissions`, `role_permissions`).

2. **Modul Kependudukan & Kartu Keluarga (KK)**:
   - Pengelolaan data KK (`kartu_keluargas`) dan individu warga (`anggota_keluargas`).
   - Pencarian NIK/KK, filter wilayah RT, dan pemantauan status kependudukan.
   - Pengajuan usulan perubahan data profil warga (`ResidentChangeRequest`) & histori persetujuan (`ResidentChangeHistory`).

3. **Modul Persuratan (Pengajuan Surat Pengantar)**:
   - Pengajuan surat publik oleh warga (tanpa login, berdasar NIK & KK).
   - Workflow persetujuan bertahap: `Submitted` -> `RT Review` -> `RW Review` -> `Approved/Completed` atau `Rejected`.
   - Tracking linimasa status persuratan publik (`LetterStatusHistory`).

4. **Modul Laporan & Aspirasi Warga (Pengaduan Inti)**:
   - Submit pengaduan warga dengan berkas lampiran (`complaint_attachments`).
   - Penugasan pengurus penangan pengaduan (`complaint_assignments`) & pembaruan status (`ComplaintStatusHistory`).
   - Portal publik tracking pengaduan.

5. **Modul Keuangan & Iuran Warga (Phase 4 Frozen & Locked)**:
   - Master data jenis iuran (`iuran_types`).
   - Buku Kas Terpusat (*Universal Ledger Core*) via `financial_transactions` (`INCOME`, `EXPENSE`, `ADJUSTMENT`) dengan *pessimistic locking* (`lockForUpdate()`) dan penomoran sekuensial otomatis.
   - Pencatatan iuran luring warga (`catatan_iuran_wargas`) berbasis KK oleh Ketua RT (status `PENDING`).
   - Audit Administrasi / Verifikasi Pembayaran oleh Bendahara RW (`APPROVE` / `REJECT`).
   - Unduh Kuitansi PDF digital (`FinancialReceiptController`).
   - Portal Transparansi Keuangan Warga (Read-Only dengan verifikasi No. KK & NIK).

6. **Admin Workspace, Audit Log & Settings**:
   - User management (Create/Edit user, activate/deactivate account).
   - System settings global (`system_settings`).
   - Audit trail komparasi data lama vs baru (`audit_logs`) dan activity log (`activity_logs`).

7. **Gateway Portal Publik Warga (`/layanan`)**:
   - Halaman utama layanan warga terpadu (Surat, Laporan, Transparansi Keuangan).

---

## 3. Fitur / Tugas yang Belum Selesai (Development Backlog)

1. **Phase 3 & 4 - Integrasi AI (Gemini) & n8n**:
   - Penghubungan Queue Job `ProcessComplaintAI` ke webhook n8n secara asinkron.
   - Pengkategorian otomatis (`INFRASTRUCTURE`, `ADMINISTRATIVE`, `SECURITY`, `ENVIRONMENT`, `UNCATEGORIZED`) dan analisis urgensi (`Low`, `Medium`, `High`).
   - *Executive Summary* dan *Trend Insight Generation* via Gemini.
   - Pembuatan tabel & model `ai_processing_logs` untuk observabilitas admin.

2. **Phase 3.5 - Integrasi Telegram Bot Service**:
   - Saluran pengaduan Telegram Bot dan notifikasi pasif ke pengurus/warga.

3. **Generator PDF & QR Code Surat Pengantar**:
   - Cetak otomatis PDF Surat Pengantar (Snappy/Dompdf) saat status *COMPLETED* beserta QR Code verification.

4. **Modul Informasi RW**:
   - Skema migrasi tabel & model untuk pengumuman (`announcements`) dan agenda kegiatan (`events`).

5. **Future Expansion**:
   - Modul Bantuan Sosial (Social Aid), Metrik Kinerja Pelayanan RT, dan Ekspor Laporan Terpadu (Excel/PDF).

---

## 4. Mandatory Coding Rules & Constraints

1. **Protect the Lock (Keuangan & Core Service Freeze)**:
   - Modul Keuangan (`LedgerService.php`, `ContributionService.php`, Eloquent Models, dan Migrations Keuangan) berstatus **FROZEN & LOCKED**. Dilarang mengubah kode di kelas tersebut tanpa instruksi eksplisit.
2. **Clean Architecture & Separation of Concerns**:
   - **Controller (Thin Controller)**: Hanya menangani request/response HTTP, validasi, otorisasi, dan memanggil Service/Repository. Dilarang menulis business logic atau query kompleks di Controller/Blade.
   - **Service Layer**: Tempat seluruh logika bisnis (*single source of truth*) dan manajemen transaksi database (`DB::transaction`).
   - **Form Request**: Seluruh input HTTP wajib divalidasi menggunakan Form Request.
   - **Policy**: Otorisasi WAJIB menggunakan Laravel Policies (`$this->authorize()`), dilarang hardcode role check seperti `$user->role === 'SUPER_ADMIN'`.
3. **Async & Resilience Rules**:
   - Integrasi AI/n8n/Telegram WAJIB via Event & Listener asinkron (`DB::afterCommit`). Dilarang blocking HTTP request pengguna.
   - Output AI dianggap un-trusted: wajib disanitasi & divalidasi.
4. **Keamanan & Audit Logging**:
   - Perubahan sensitif pada model wajib menghasilkan record di `audit_logs` atau `activity_logs`.
   - Dilarang hardcoded credentials/API key di kode (gunakan `.env` & `config/`).
5. **Metodologi FICA (Fast Implementation with Controlled Audit)**:
   - Gunakan pendekatan FICA untuk penyelesaian sisa modul secara efektif dan terverifikasi.
