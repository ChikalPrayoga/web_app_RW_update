const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log("Using browser at:", chromePath);

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dokumentasi Lengkap Aplikasi SIM RW (Bahan Persiapan Sidang Skripsi)</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 18mm 22mm 18mm;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        body {
            font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.55;
            color: #334155;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* --- COVER PAGE --- */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            box-sizing: border-box;
            padding: 10mm 5mm;
        }

        .cover-banner {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            color: #ffffff;
            padding: 35px 30px;
            border-radius: 12px;
            border-left: 8px solid #2563EB;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        }

        .cover-banner h1 {
            font-size: 24pt;
            font-weight: 800;
            margin: 0 0 12px 0;
            line-height: 1.25;
            letter-spacing: -0.5px;
            color: #ffffff;
        }

        .cover-banner h2 {
            font-size: 13pt;
            font-weight: 600;
            color: #93C5FD;
            margin: 0 0 15px 0;
        }

        .cover-banner p {
            font-size: 9.5pt;
            color: #CBD5E1;
            margin: 0;
            line-height: 1.5;
        }

        .cover-meta {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 22px 25px;
            margin-top: 20px;
        }

        .cover-meta h3 {
            font-size: 11pt;
            color: #0F172A;
            margin-top: 0;
            margin-bottom: 14px;
            border-bottom: 2px solid #2563EB;
            padding-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: 160px 1fr;
            row-gap: 10px;
            column-gap: 15px;
            font-size: 9pt;
        }

        .meta-label {
            font-weight: 700;
            color: #1E293B;
        }

        .meta-value {
            color: #475569;
        }

        .cover-footer {
            text-align: center;
            font-size: 8.5pt;
            color: #64748B;
            border-top: 1px solid #E2E8F0;
            padding-top: 15px;
            font-style: italic;
        }

        /* --- HEADINGS & TYPOGRAPHY --- */
        h1.section-title {
            font-size: 14pt;
            font-weight: 800;
            color: #ffffff;
            background: #0F172A;
            padding: 10px 16px;
            border-radius: 6px;
            margin-top: 24px;
            margin-bottom: 16px;
            page-break-after: avoid;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        h2 {
            font-size: 12pt;
            font-weight: 700;
            color: #1E293B;
            border-bottom: 2px solid #2563EB;
            padding-bottom: 4px;
            margin-top: 20px;
            margin-bottom: 12px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 10.5pt;
            font-weight: 700;
            color: #2563EB;
            margin-top: 14px;
            margin-bottom: 8px;
            page-break-after: avoid;
        }

        h4 {
            font-size: 9.5pt;
            font-weight: 700;
            color: #0F172A;
            margin-top: 10px;
            margin-bottom: 6px;
            page-break-after: avoid;
        }

        p {
            margin-top: 0;
            margin-bottom: 10px;
            text-align: justify;
        }

        ul, ol {
            margin-top: 0;
            margin-bottom: 12px;
            padding-left: 20px;
        }

        li {
            margin-bottom: 5px;
        }

        code {
            font-family: 'Consolas', 'Courier New', monospace;
            background-color: #F1F5F9;
            color: #0F172A;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 9pt;
            border: 1px solid #E2E8F0;
        }

        pre {
            font-family: 'Consolas', 'Courier New', monospace;
            background-color: #0F172A;
            color: #F8FAFC;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 8.5pt;
            line-height: 1.45;
            overflow-x: auto;
            margin-top: 8px;
            margin-bottom: 14px;
            page-break-inside: avoid;
        }

        /* --- TABLES --- */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 16px;
            font-size: 8.5pt;
            page-break-inside: avoid;
        }

        th {
            background-color: #1E293B;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #334155;
            font-size: 8.5pt;
        }

        td {
            padding: 7px 10px;
            border: 1px solid #CBD5E1;
            vertical-align: top;
        }

        tr:nth-child(even) {
            background-color: #F8FAFC;
        }

        tr:hover {
            background-color: #F1F5F9;
        }

        /* --- CARDS & CALLOUTS --- */
        .card {
            background-color: #ffffff;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            page-break-inside: avoid;
        }

        .callout {
            border-left: 5px solid #2563EB;
            background-color: #EFF6FF;
            padding: 12px 16px;
            border-radius: 4px 8px 8px 4px;
            margin-top: 10px;
            margin-bottom: 14px;
            page-break-inside: avoid;
        }

        .callout-title {
            font-weight: 700;
            font-size: 9.5pt;
            color: #1E40AF;
            margin-bottom: 4px;
        }

        .callout-body {
            font-size: 8.5pt;
            color: #1E3A8A;
            margin: 0;
        }

        .callout-warning {
            border-left-color: #D97706;
            background-color: #FFFBEB;
        }
        .callout-warning .callout-title { color: #92400E; }
        .callout-warning .callout-body { color: #78350F; }

        .callout-success {
            border-left-color: #16A34A;
            background-color: #F0FDF4;
        }
        .callout-success .callout-title { color: #166534; }
        .callout-success .callout-body { color: #14532D; }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 7.5pt;
            font-weight: 700;
            border-radius: 12px;
            text-transform: uppercase;
        }
        .badge-green { background-color: #DCFCE7; color: #166534; }
        .badge-amber { background-color: #FEF3C7; color: #92400E; }
        .badge-blue { background-color: #DBEAFE; color: #1E40AF; }

        /* --- TOC TABLE --- */
        .toc-table td {
            padding: 6px 10px;
        }
        .toc-chapter {
            font-weight: 700;
            color: #0F172A;
            background-color: #F1F5F9;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <div>
            <div class="cover-banner">
                <h1>DOKUMENTASI LENGKAP APLIKASI SIM RW</h1>
                <h2>Sistem Informasi Manajemen Rukun Warga 047 (SIM RW 047)</h2>
                <p>Bahan Persiapan Sidang Skripsi — Rangkuman Integrasi Arsitektur Sistem, Dokumentasi Basis Data, dan Panduan Pengembang</p>
            </div>

            <div class="cover-meta">
                <h3>Metadata Dokumen & Referensi Sistem</h3>
                <div class="meta-grid">
                    <div class="meta-label">Nama Aplikasi</div>
                    <div class="meta-value">Aplikasi SIM RW 047 (Versi 2.0)</div>

                    <div class="meta-label">Framework Utama</div>
                    <div class="meta-value">Laravel 10.x (PHP 8.1+) & Vite / TailwindCSS / Alpine.js</div>

                    <div class="meta-label">Arsitektur Kode</div>
                    <div class="meta-value">Controller-Service-Repository + Event-Driven Architecture</div>

                    <div class="meta-label">Integrasi Eksternal</div>
                    <div class="meta-value">n8n Workflow Engine (AI Enhancement Layer)</div>

                    <div class="meta-label">Database Engine</div>
                    <div class="meta-value">MySQL / MariaDB (Soft Deletes, Polymorphic Relations, Audit Trail)</div>

                    <div class="meta-label">Tanggal Pembuatan</div>
                    <div class="meta-value">24 Juli 2026</div>

                    <div class="meta-label">Tujuan Dokumen</div>
                    <div class="meta-value">Panduan Arsitektur Teknis, Dokumentasi Living Codebase, & Material Sidang Skripsi</div>
                </div>
            </div>
        </div>

        <div class="cover-footer">
            Disusun secara terintegrasi berdasarkan analisis kode sumber (*source code*) dan berkas migrasi repository SIM RW 047.
        </div>
    </div>

    <!-- DAFTAR ISI -->
    <h2>DAFTAR ISI RINGKAS DOKUMENTASI</h2>
    <p>Dokumen ini merangkum secara komprehensif tiga berkas dokumentasi utama: <code>SYSTEM_ARCHITECTURE_AND_DIAGRAMS.md</code>, <code>MIGRATION_REFERENCE.md</code>, dan <code>DEVELOPER_DOCUMENTATION.md</code>.</p>

    <table class="toc-table">
        <thead>
            <tr>
                <th style="width: 75%;">Judul Bab / Sub-bab</th>
                <th style="width: 25%;">Navigasi Bagian</th>
            </tr>
        </thead>
        <tbody>
            <tr class="toc-chapter">
                <td colspan="2">BAGIAN 1: ARSITEKTUR & DIAGRAM SISTEM (SYSTEM ARCHITECTURE & DIAGRAMS)</td>
            </tr>
            <tr><td>1.1 Gambaran Umum & Pola Arsitektur (Controller-Service-Repository)</td><td>Bagian 1</td></tr>
            <tr><td>1.2 High-Level Architecture & Integrasi Komponen System</td><td>Bagian 1</td></tr>
            <tr><td>1.3 Diagram Kasus Penggunaan (Use Case Diagram & Aktor)</td><td>Bagian 1</td></tr>
            <tr><td>1.4 Diagram Aktivitas (Activity Diagram: Surat, Keluhan AI, Iuran Ledger)</td><td>Bagian 1</td></tr>
            <tr><td>1.5 Diagram Urutan (Sequence Diagram: Process Approval & Auto Ledger)</td><td>Bagian 1</td></tr>
            <tr><td>1.6 Diagram Kelas (Class Diagram Architecture)</td><td>Bagian 1</td></tr>
            <tr><td>1.7 Entity Relationship Diagram (ERD & Cardinality Rules)</td><td>Bagian 1</td></tr>
            <tr><td>1.8 Alur Bisnis & Aturan Sistem (RBAC, General Ledger, AI Fault Tolerance)</td><td>Bagian 1</td></tr>

            <tr class="toc-chapter">
                <td colspan="2">BAGIAN 2: STRUKTUR BASIS DATA & REFERENSI MIGRATION</td>
            </tr>
            <tr><td>2.1 Ringkasan Migration Repository</td><td>Bagian 2</td></tr>
            <tr><td>2.2 Tabel users (User Accounts & System Access)</td><td>Bagian 2</td></tr>
            <tr><td>2.3 Tabel kartu_keluargas (Data Kartu Keluarga)</td><td>Bagian 2</td></tr>
            <tr><td>2.4 Tabel anggota_keluargas / warga (Data Induk Kependudukan)</td><td>Bagian 2</td></tr>
            <tr><td>2.5 Tabel pengajuan_surats (Persuratan & Approval Workflow)</td><td>Bagian 2</td></tr>
            <tr><td>2.6 Tabel log_laporan_aspirasis (Pengaduan & Fields AI)</td><td>Bagian 2</td></tr>
            <tr><td>2.7 Tabel Keuangan (catatan_iuran_wargas, financial_transactions, iuran_types)</td><td>Bagian 2</td></tr>
            <tr><td>2.8 Tabel Hak Akses & Audit Trail (roles, permissions, audit_logs)</td><td>Bagian 2</td></tr>

            <tr class="toc-chapter">
                <td colspan="2">BAGIAN 3: PANDUAN PENGEMBANG & ARSITEKTUR KODE</td>
            </tr>
            <tr><td>3.1 Struktur Direktori Project Laravel</td><td>Bagian 3</td></tr>
            <tr><td>3.2 Penjelasan 6 Modul Utama Aplikasi SIM RW</td><td>Bagian 3</td></tr>
            <tr><td>3.3 Arsitektur Kode (Controller, Service, Repository Roles)</td><td>Bagian 3</td></tr>
            <tr><td>3.4 Middleware Stack & Aliases</td><td>Bagian 3</td></tr>
            <tr><td>3.5 Pemetaan Rute (web.php, auth.php, api.php)</td><td>Bagian 3</td></tr>
            <tr><td>3.6 Form Request Validation & System Authorization Rules</td><td>Bagian 3</td></tr>
            <tr><td>3.7 Autentikasi & Otorisasi RBAC Matrix</td><td>Bagian 3</td></tr>
            <tr><td>3.8 Event, Listener, Queue & Integrasi AI (N8nService)</td><td>Bagian 3</td></tr>
            <tr><td>3.9 Konfigurasi Variable Environment (.env)</td><td>Bagian 3</td></tr>
            <tr><td>3.10 Panduan Menjalankan Proyek (How to Run)</td><td>Bagian 3</td></tr>
            <tr><td>3.11 Panduan Menambah Fitur Baru (Step-by-Step Developer Guide)</td><td>Bagian 3</td></tr>
        </tbody>
    </table>

    <div class="page-break"></div>

    <!-- BAGIAN 1 -->
    <h1 class="section-title">BAGIAN 1: ARSITEKTUR & DIAGRAM SISTEM</h1>

    <h2>1.1 Gambaran Umum & Pola Arsitektur</h2>
    <p>Aplikasi SIM RW 047 menerapkan pola arsitektur <strong>Controller-Service-Repository</strong> yang memperluas arsitektur standar MVC (Model-View-Controller) milik Laravel. Pola ini memisahkan tanggung jawab sistem secara tegas (<em>Separation of Concerns</em>):</p>

    <ul>
        <li><strong>Presentation Layer (View & Controller):</strong> Blade Engine + TailwindCSS + Alpine.js mengelola antarmuka pengguna. Controller menangani HTTP Request, memvalidasi input via Form Request, dan memeriksa otorisasi Policy.</li>
        <li><strong>Domain & Business Logic Layer (Services):</strong> Mengenkapsulasi logika bisnis utama, mengelola transaksi database (<code>DB::transaction</code>), mengelola berkas upload, memicu Event internal, dan mengintegrasikan layanan AI eksternal.</li>
        <li><strong>Data Access Layer (Repositories & Models):</strong> Mengabstraksi query database Eloquent (eager loading, pagination, search filter) dan pemetaan tabel relational MySQL.</li>
    </ul>

    <h2>1.2 High-Level Architecture</h2>
    <p>Arsitektur tingkat tinggi SIM RW 047 menghubungkan pengguna publik/pengurus melalui Laravel Web Server Engine menuju Layer Layanan & Integrasi AI n8n eksternal:</p>

    <div class="card">
        <h4>Komponen Utama High-Level Architecture:</h4>
        <ul>
            <li><strong>Client Layer:</strong> Warga mengakses Portal Publik (layanan tanpa login via verifikasi NIK/No.KK). Pengurus RT/RW & Admin mengakses Dashboard Terproteksi.</li>
            <li><strong>Laravel Core Engine:</strong> Router -&gt; Middleware Stack (Auth, CSRF, Role Check) -&gt; Authorization Policy -&gt; Form Request Validation -&gt; Controller -&gt; Service &amp; Repository -&gt; Eloquent Models.</li>
            <li><strong>Integration Layer:</strong> n8n Workflow Engine berkomunikasi via REST API (<code>N8nService</code>) untuk kategorisasi keluhan warga, estimasi prioritas, dan pembuat ringkasan otomatis.</li>
            <li><strong>Data Storage:</strong> Database MySQL (Relational Tables, Soft Deletes, Audit Trail) &amp; Storage Lokal (Berkas Surat &amp; Lampiran Keluhan).</li>
        </ul>
    </div>

    <h2>1.3 Diagram Kasus Penggunaan (Use Case Diagram & Identifikasi Aktor)</h2>
    <p>Sistem mengidentifikasi 5 aktor utama dengan batasan hak akses yang jelas:</p>

    <ul>
        <li><strong>Warga (Public Portal):</strong> Mengajukan surat keterangan, melacak status pengajuan, mengirim laporan keluhan/aspirasi, melacak keluhan, serta melihat transparansi keuangan &amp; konfirmasi iuran.</li>
        <li><strong>Ketua RT (Pengurus RT):</strong> Mengelola data KK &amp; warga lingkup RT, memverifikasi pengajuan surat tahap 1 (<code>PROCESSED_RT</code>), memproses keluhan, dan mencatat iuran.</li>
        <li><strong>Ketua RW (Pengurus RW):</strong> Mengelola data KK/warga seluruh RW, memberikan approval akhir surat (<code>COMPLETED</code> + Nomor Surat), memproses/menugaskan keluhan, serta mengelola kas RW.</li>
        <li><strong>Super Admin:</strong> Akses penuh (<code>manage_system</code>), manajemen akun user, matriks role/permission, konfigurasi sistem, dan pemantauan log audit.</li>
        <li><strong>Auditor:</strong> Akses pembacaan (<em>read-only</em>) laporan keuangan dan log audit sistem.</li>
    </ul>

    <table>
        <thead>
            <tr>
                <th style="width: 12%;">ID Use Case</th>
                <th style="width: 25%;">Nama Use Case</th>
                <th style="width: 18%;">Aktor Utama</th>
                <th style="width: 45%;">Deskripsi Singkat</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>UC-01</td><td>Mengajukan Surat Keterangan</td><td>Warga</td><td>Warga mengisi form pengajuan surat online dengan NIK &amp; keperluan</td></tr>
            <tr><td>UC-02</td><td>Melacak Status Pengajuan Surat</td><td>Warga</td><td>Melacak perkembangan status surat via NIK / kode tracking</td></tr>
            <tr><td>UC-03</td><td>Mengirim Laporan Aspirasi</td><td>Warga</td><td>Pengiriman keluhan publik + lampiran berkas pendukung</td></tr>
            <tr><td>UC-04</td><td>Melihat Transparansi Keuangan</td><td>Warga</td><td>Akses terbuka laporan kas RW dan riwayat iuran keluarga</td></tr>
            <tr><td>UC-05</td><td>Verifikasi Surat Tahap RT</td><td>Ketua RT</td><td>Pemeriksaan awal pengajuan surat oleh pengurus RT</td></tr>
            <tr><td>UC-06</td><td>Approval Akhir Surat Tahap RW</td><td>Ketua RW</td><td>Persetujuan akhir, generasi nomor surat resmi, dan penyelesaian</td></tr>
            <tr><td>UC-07</td><td>Delegasi &amp; Penanganan Keluhan</td><td>Pengurus RT/RW</td><td>Penugasan staf/pengurus untuk penyelesaian keluhan lapangan</td></tr>
            <tr><td>UC-08</td><td>Verifikasi &amp; Auto Ledger Iuran</td><td>Pengurus Keuangan</td><td>Persetujuan iuran warga &amp; otomatisasi posting ke General Ledger</td></tr>
            <tr><td>UC-09</td><td>Manajemen User &amp; RBAC Matrix</td><td>Super Admin</td><td>Pengaturan akun, peranan (role), izin (permission), dan audit log</td></tr>
        </tbody>
    </table>

    <h2>1.4 Diagram Aktivitas (Activity Diagram)</h2>

    <h3>A. Activity Diagram: Pengajuan & Persetujuan Surat Keterangan</h3>
    <p>Warga mengajukan surat di portal (<code>/layanan/surat</code>) -&gt; Form Request memvalidasi input -&gt; Sistem menyimpan record (status: <code>SUBMITTED</code>) -&gt; Event <code>LetterSubmitted</code> dipicu -&gt; Pengurus RT memverifikasi (<code>PROCESSED_RT</code> / <code>REJECTED</code>) -&gt; Pengurus RW menyetujui (<code>COMPLETED</code> + Nomor Surat) -&gt; Warga/Pengurus mengunduh surat.</p>

    <h3>B. Activity Diagram: Pengaduan Warga & AI Enhancement (n8n)</h3>
    <p>Warga mengirim keluhan + berkas di <code>/layanan/laporan</code> -&gt; Simpan <code>LogLaporanAspirasi</code> &amp; <code>ComplaintAttachment</code> -&gt; Dispatch Event <code>ComplaintSubmitted</code> -&gt; <code>N8nService</code> memanggil webhook n8n secara asinkron -&gt; n8n mengembalikan <code>ai_category</code>, <code>ai_priority</code>, <code>ai_summary</code> -&gt; Pengurus menerima keluhan terstruktur -&gt; Delegasi ke staf -&gt; Status <code>RESOLVED</code>.</p>

    <h3>C. Activity Diagram: Pembayaran Iuran & Auto General Ledger Posting</h3>
    <p>Warga/Pengurus mengunggah bukti bayar iuran -&gt; Record <code>CatatanIuranWarga</code> (status: <code>PENDING</code>) -&gt; Pengurus Keuangan meninjau bukti -&gt; Jika disetujui (<code>APPROVED</code>), <code>LedgerService</code> secara otomatis membuat record <code>FinancialTransaction</code> (<code>INCOME</code>) yang terhubung via Morphic Reference ke catatan iuran -&gt; Saldo &amp; laporan transparansi publik terbarui.</p>

    <h2>1.5 Diagram Urutan (Sequence Diagram)</h2>

    <h3>Sequence 1: Pengajuan Surat & Multi-Stage Approval</h3>
    <p><strong>Interaksi Komponen:</strong> Warga -&gt; Router -&gt; <code>StoreLetterRequest</code> -&gt; <code>PublicLetterController</code> -&gt; <code>LetterRequestService</code> -&gt; <code>LetterRepository</code> -&gt; <code>PengajuanSurat</code> Model -&gt; DB MySQL. Pada tahap approval: Pengurus -&gt; <code>AdminLetterController</code> -&gt; <code>LetterApprovalService</code> -&gt; <code>PengajuanSurat</code> Model (Update Status) -&gt; <code>LetterStatusHistory</code> Model (Insert History).</p>

    <h3>Sequence 2: Verifikasi Iuran & Auto Ledger Posting</h3>
    <p><strong>Interaksi Komponen:</strong> Pengurus Keuangan -&gt; Router -&gt; <code>PaymentVerificationController</code> -&gt; <code>ContributionService</code> -&gt; <code>CatatanIuranWarga</code> Model (Update <code>APPROVED</code>) -&gt; <code>LedgerService</code> -&gt; <code>FinancialTransaction</code> Model (Insert <code>INCOME</code>) -&gt; DB MySQL (Commit Transaction).</p>

    <h2>1.6 Diagram Kelas (Class Diagram Architecture)</h2>
    <p>Kelas-kelas dalam aplikasi SIM RW 047 saling terhubung dengan pola Dependency Injection:</p>
    <ul>
        <li><strong>Controller Layer:</strong> <code>AdminLetterController</code>, <code>PublicLetterController</code>, <code>ComplaintController</code>, <code>PaymentVerificationController</code>, <code>FinancialTransactionController</code>.</li>
        <li><strong>Service Layer:</strong> <code>LetterRequestService</code>, <code>LetterApprovalService</code>, <code>ComplaintService</code>, <code>ContributionService</code>, <code>LedgerService</code>, <code>N8nService</code>.</li>
        <li><strong>Repository Layer:</strong> <code>LetterRepository</code>, <code>ComplaintRepository</code>, <code>WargaRepository</code>, <code>KartuKeluargaRepository</code>.</li>
        <li><strong>Model Layer:</strong> <code>User</code>, <code>AnggotaKeluarga</code>, <code>KartuKeluarga</code>, <code>PengajuanSurat</code>, <code>LogLaporanAspirasi</code>, <code>CatatanIuranWarga</code>, <code>FinancialTransaction</code>.</li>
    </ul>

    <h2>1.7 Entity Relationship Diagram (ERD & Cardinalities)</h2>
    <p>Relasi antar entitas utama pada database SIM RW 047:</p>
    <ul>
        <li><code>roles (1) &lt;---&gt; (N) users</code>: Setiap user memiliki satu <code>role_id</code> (opsional).</li>
        <li><code>roles (N) &lt;---&gt; (M) permissions</code>: Dihubungkan via tabel pivot <code>role_permissions</code>.</li>
        <li><code>kartu_keluargas (1) &lt;---&gt; (N) anggota_keluargas</code>: Satu KK memuat banyak anggota keluarga (warga). Foreign key <code>no_kk</code> dengan <code>CASCADE</code> delete.</li>
        <li><code>anggota_keluargas (1) &lt;---&gt; (N) pengajuan_surats</code>: Satu warga dapat mengajukan banyak surat.</li>
        <li><code>anggota_keluargas (1) &lt;---&gt; (N) log_laporan_aspirasis</code>: Satu warga dapat mengirimkan banyak laporan keluhan.</li>
        <li><code>kartu_keluargas (1) &lt;---&gt; (N) catatan_iuran_wargas</code>: Setiap catatan iuran terikat pada satu <code>no_kk</code>.</li>
        <li><code>catatan_iuran_wargas (1) &lt;---&gt; (1) financial_transactions</code>: Relasi Polimorfik (<code>morphOne</code>) di mana transaksi keuangan mencatat referensi iuran.</li>
        <li><code>financial_transactions (1) &lt;---&gt; (1) financial_transactions</code>: Self-referencing relationship (<code>adjusted_transaction_id</code>) untuk koreksi/reversal transaksi.</li>
    </ul>

    <h2>1.8 Alur Bisnis & Aturan Sistem (Business Logic & System Rules)</h2>

    <div class="callout">
        <div class="callout-title">ATURAN OTORISASI RBAC</div>
        <div class="callout-body">
            1. Super Admin memiliki akses mutlak (bypass full) via <code>hasPermissionTo()</code>.<br>
            2. Ketua RT terbatas pada data kependudukan &amp; verifikasi tahap 1 di wilayah RT-nya.<br>
            3. Ketua RW memiliki wewenang seluruh RT di lingkup RW dan persetujuan akhir surat.<br>
            4. Warga publik dapat mengakses layanan tanpa login via verifikasi NIK/No.KK.
        </div>
    </div>

    <div class="callout callout-warning">
        <div class="callout-title">ATURAN GENERAL LEDGER & IMMUTABILITY</div>
        <div class="callout-body">
            Setiap transaksi pada <code>financial_transactions</code> bersifat immutable (tidak boleh di-hard delete atau di-update langsung). Koreksi kesalahan transaksi wajib dilakukan melalui mekanisme Reversal/Adjustment yang membuat transaksi pembalik baru.
        </div>
    </div>

    <div class="callout callout-success">
        <div class="callout-title">ATURAN FAULT-TOLERANT INTEGRASI AI</div>
        <div class="callout-body">
            Integrasi AI (n8n Workflow Engine) bersifat Enhancement Layer non-blocking. Apabila server n8n mengalami timeout atau offline, proses pengajuan keluhan warga tetap berjalan lancar dan disimpan ke database dengan nilai kolom AI bernilai <code>NULL</code>.
        </div>
    </div>

    <div class="page-break"></div>

    <!-- BAGIAN 2 -->
    <h1 class="section-title">BAGIAN 2: STRUKTUR BASIS DATA & REFERENSI MIGRATION</h1>

    <h2>2.1 Ringkasan Migration Repository</h2>
    <p>Seluruh struktur basis data SIM RW 047 dirancang menggunakan file Migration Laravel yang menjamin konsistensi skema dan integritas data.</p>

    <table>
        <thead>
            <tr>
                <th style="width: 8%;">No</th>
                <th style="width: 22%;">Tabel Diminta</th>
                <th style="width: 25%;">Tabel Migration</th>
                <th style="width: 30%;">File Migration Laravel</th>
                <th style="width: 15%;">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1</td><td>users</td><td>users</td><td>2014_10_12_000000_create_users_table.php</td><td><span class="badge badge-green">Ditemukan</span></td></tr>
            <tr><td>2</td><td>kartu_keluarga</td><td>kartu_keluargas</td><td>2026_06_10_062643_create_kartu_keluargas_table.php</td><td><span class="badge badge-green">Ditemukan</span></td></tr>
            <tr><td>3</td><td>warga</td><td>anggota_keluargas</td><td>2026_06_10_062644_create_anggota_keluargas_table.php</td><td><span class="badge badge-amber">anggota_keluargas</span></td></tr>
            <tr><td>4</td><td>pengajuan_surat</td><td>pengajuan_surats</td><td>2026_06_11_184552_create_pengajuan_surats_table.php</td><td><span class="badge badge-green">Ditemukan</span></td></tr>
            <tr><td>5</td><td>laporan_aspirasi</td><td>log_laporan_aspirasis</td><td>2026_06_10_085707_create_log_laporan_aspirasis_table.php</td><td><span class="badge badge-green">Ditemukan</span></td></tr>
        </tbody>
    </table>

    <h2>2.2 Tabel: users</h2>
    <p>Menyimpan data akun pengguna/pengurus sistem yang terikat dengan peran (role) dan mendukung soft delete.</p>

    <table>
        <thead>
            <tr>
                <th style="width: 22%;">Kolom</th>
                <th style="width: 20%;">Tipe Data</th>
                <th style="width: 12%;">Nullable</th>
                <th style="width: 16%;">Default</th>
                <th style="width: 30%;">Keterangan &amp; Relasi</th>
            </tr>
        </thead>
        <tbody>
            <tr><td><code>user_id</code></td><td>BIGINT UNSIGNED</td><td>Tidak</td><td>Auto Increment</td><td>Primary Key (<code>$table-&gt;id()</code>)</td></tr>
            <tr><td><code>role_id</code></td><td>BIGINT UNSIGNED</td><td>Ya</td><td>NULL</td><td>FK ke <code>roles(role_id)</code>, onDelete: SET NULL</td></tr>
            <tr><td><code>username</code></td><td>VARCHAR(255)</td><td>Tidak</td><td>—</td><td>Unique constraint</td></tr>
            <tr><td><code>email</code></td><td>VARCHAR(255)</td><td>Tidak</td><td>—</td><td>Unique constraint</td></tr>
            <tr><td><code>email_verified_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Waktu verifikasi email</td></tr>
            <tr><td><code>password</code></td><td>VARCHAR(255)</td><td>Tidak</td><td>—</td><td>Hash password terenkripsi</td></tr>
            <tr><td><code>full_name</code></td><td>VARCHAR(255)</td><td>Tidak</td><td>—</td><td>Nama lengkap pengguna</td></tr>
            <tr><td><code>phone_number</code></td><td>VARCHAR(255)</td><td>Ya</td><td>NULL</td><td>Nomor telepon kontak</td></tr>
            <tr><td><code>status</code></td><td>ENUM</td><td>Tidak</td><td>ACTIVE</td><td>Nilai ENUM: ACTIVE, INACTIVE</td></tr>
            <tr><td><code>last_login_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Waktu login terakhir</td></tr>
            <tr><td><code>remember_token</code></td><td>VARCHAR(100)</td><td>Ya</td><td>NULL</td><td>Token remember me Laravel</td></tr>
            <tr><td><code>created_at / updated_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Timestamps Laravel</td></tr>
            <tr><td><code>deleted_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Soft delete (<code>$table-&gt;softDeletes()</code>)</td></tr>
        </tbody>
    </table>

    <h2>2.3 Tabel: kartu_keluargas</h2>
    <p>Menyimpan data induk Kartu Keluarga (KK) dengan primary key natural <code>no_kk</code> (16 digit).</p>

    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Kolom</th>
                <th style="width: 18%;">Tipe Data</th>
                <th style="width: 12%;">Nullable</th>
                <th style="width: 15%;">Default</th>
                <th style="width: 30%;">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            <tr><td><code>no_kk</code></td><td>VARCHAR(16)</td><td>Tidak</td><td>—</td><td>Primary Key (Natural Key 16 digit)</td></tr>
            <tr><td><code>rt_code</code></td><td>VARCHAR(5)</td><td>Tidak</td><td>—</td><td>Kode RT wilayah perumahan</td></tr>
            <tr><td><code>alamat_lengkap</code></td><td>TEXT</td><td>Tidak</td><td>—</td><td>Alamat lengkap tempat tinggal</td></tr>
            <tr><td><code>blok</code></td><td>VARCHAR(10)</td><td>Ya</td><td>NULL</td><td>Blok perumahan</td></tr>
            <tr><td><code>nomor_rumah</code></td><td>VARCHAR(10)</td><td>Ya</td><td>NULL</td><td>Nomor rumah</td></tr>
            <tr><td><code>status_kepemilikan_rumah</code></td><td>VARCHAR(50)</td><td>Ya</td><td>NULL</td><td>Milik Sendiri / Sewa / Kontrak / dll</td></tr>
            <tr><td><code>created_at / updated_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Timestamps Laravel</td></tr>
            <tr><td><code>deleted_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Soft delete</td></tr>
        </tbody>
    </table>

    <h2>2.4 Tabel: anggota_keluargas (Representasi Data Warga)</h2>
    <p>Menyimpan data individu warga yang merupakan anggota KK. Menggunakan <code>nik</code> (16 digit) sebagai primary key.</p>

    <table>
        <thead>
            <tr>
                <th style="width: 24%;">Kolom</th>
                <th style="width: 18%;">Tipe Data</th>
                <th style="width: 10%;">Nullable</th>
                <th style="width: 15%;">Default</th>
                <th style="width: 33%;">Keterangan &amp; Relasi</th>
            </tr>
        </thead>
        <tbody>
            <tr><td><code>nik</code></td><td>VARCHAR(16)</td><td>Tidak</td><td>—</td><td>Primary Key (Natural Key NIK 16 digit)</td></tr>
            <tr><td><code>no_kk</code></td><td>VARCHAR(16)</td><td>Tidak</td><td>—</td><td>FK ke <code>kartu_keluargas(no_kk)</code>, onDelete: CASCADE</td></tr>
            <tr><td><code>nama_lengkap</code></td><td>VARCHAR(255)</td><td>Tidak</td><td>—</td><td>Nama lengkap warga</td></tr>
            <tr><td><code>jenis_kelamin</code></td><td>ENUM</td><td>Tidak</td><td>—</td><td>Nilai ENUM: L (Laki-laki), P (Perempuan)</td></tr>
            <tr><td><code>tempat_lahir</code></td><td>VARCHAR(255)</td><td>Tidak</td><td>—</td><td>Tempat lahir</td></tr>
            <tr><td><code>tanggal_lahir</code></td><td>DATE</td><td>Tidak</td><td>—</td><td>Tanggal lahir</td></tr>
            <tr><td><code>pekerjaan</code></td><td>VARCHAR(255)</td><td>Ya</td><td>NULL</td><td>Pekerjaan warga</td></tr>
            <tr><td><code>nomor_hp</code></td><td>VARCHAR(20)</td><td>Ya</td><td>NULL</td><td>Nomor kontak HP</td></tr>
            <tr><td><code>status_hubungan_keluarga</code></td><td>VARCHAR(50)</td><td>Tidak</td><td>—</td><td>Kepala Keluarga / Istri / Anak / dll</td></tr>
            <tr><td><code>status_sosio_ekonomi</code></td><td>VARCHAR(50)</td><td>Ya</td><td>NULL</td><td>Status ekonomi warga</td></tr>
            <tr><td><code>status_warga</code></td><td>VARCHAR(50)</td><td>Tidak</td><td>AKTIF</td><td>Status kependudukan (AKTIF/PINDAH/MENINGGAL)</td></tr>
            <tr><td><code>created_at / updated_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Timestamps Laravel</td></tr>
            <tr><td><code>deleted_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Soft delete</td></tr>
        </tbody>
    </table>

    <h2>2.5 Tabel: pengajuan_surats</h2>
    <p>Menyimpan data permohonan surat keterangan oleh warga beserta alur status persetujuan.</p>

    <table>
        <thead>
            <tr>
                <th style="width: 22%;">Kolom</th>
                <th style="width: 18%;">Tipe Data</th>
                <th style="width: 10%;">Nullable</th>
                <th style="width: 20%;">Default</th>
                <th style="width: 30%;">Keterangan &amp; Relasi</th>
            </tr>
        </thead>
        <tbody>
            <tr><td><code>pengajuan_id</code></td><td>BIGINT UNSIGNED</td><td>Tidak</td><td>Auto Increment</td><td>Primary Key (<code>$table-&gt;id()</code>)</td></tr>
            <tr><td><code>nik</code></td><td>VARCHAR(16)</td><td>Tidak</td><td>—</td><td>FK ke <code>anggota_keluargas(nik)</code>, onDelete: CASCADE</td></tr>
            <tr><td><code>nomor_surat</code></td><td>VARCHAR(100)</td><td>Ya</td><td>NULL</td><td>Nomor surat resmi (diisi saat status COMPLETED)</td></tr>
            <tr><td><code>jenis_surat</code></td><td>VARCHAR(50)</td><td>Tidak</td><td>—</td><td>Tipe surat (LetterTypeEnum)</td></tr>
            <tr><td><code>keperluan</code></td><td>TEXT</td><td>Tidak</td><td>—</td><td>Uraian keperluan pengajuan surat</td></tr>
            <tr><td><code>current_status</code></td><td>VARCHAR(50)</td><td>Tidak</td><td>SUBMITTED</td><td>Status (SUBMITTED/PROCESSED_RT/COMPLETED/REJECTED)</td></tr>
            <tr><td><code>tanggal_pengajuan</code></td><td>TIMESTAMP</td><td>Tidak</td><td>CURRENT_TIMESTAMP</td><td>Waktu pengajuan (<code>useCurrent()</code>)</td></tr>
            <tr><td><code>tanggal_selesai</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Waktu penyelesaian surat</td></tr>
            <tr><td><code>deleted_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Soft delete</td></tr>
        </tbody>
    </table>

    <h2>2.6 Tabel: log_laporan_aspirasis</h2>
    <p>Menyimpan data laporan pengaduan/aspirasi warga yang dilengkapi dengan kolom hasil analisis AI n8n.</p>

    <table>
        <thead>
            <tr>
                <th style="width: 22%;">Kolom</th>
                <th style="width: 18%;">Tipe Data</th>
                <th style="width: 10%;">Nullable</th>
                <th style="width: 20%;">Default</th>
                <th style="width: 30%;">Keterangan &amp; Field AI</th>
            </tr>
        </thead>
        <tbody>
            <tr><td><code>aspirasi_id</code></td><td>BIGINT UNSIGNED</td><td>Tidak</td><td>Auto Increment</td><td>Primary Key (<code>$table-&gt;id()</code>)</td></tr>
            <tr><td><code>nik</code></td><td>VARCHAR(16)</td><td>Tidak</td><td>—</td><td>FK ke <code>anggota_keluargas(nik)</code>, onDelete: CASCADE</td></tr>
            <tr><td><code>kanal_laporan</code></td><td>VARCHAR(50)</td><td>Tidak</td><td>WEB</td><td>Kanal pengiriman (WEB/APP)</td></tr>
            <tr><td><code>teks_keluhan</code></td><td>TEXT</td><td>Tidak</td><td>—</td><td>Isi pengaduan/aspirasi warga</td></tr>
            <tr><td><code>ai_category</code></td><td>VARCHAR(50)</td><td>Ya</td><td>NULL</td><td>Kategori otomatis hasil analisis AI</td></tr>
            <tr><td><code>ai_priority</code></td><td>VARCHAR(50)</td><td>Ya</td><td>NULL</td><td>Prioritas keluhan (LOW/MEDIUM/HIGH/CRITICAL)</td></tr>
            <tr><td><code>ai_summary</code></td><td>TEXT</td><td>Ya</td><td>NULL</td><td>Ringkasan singkat hasil ekstraksi AI</td></tr>
            <tr><td><code>ai_confidence</code></td><td>DECIMAL(5,2)</td><td>Ya</td><td>NULL</td><td>Skor kepercayaan AI (0.00-100.00)</td></tr>
            <tr><td><code>current_status</code></td><td>VARCHAR(50)</td><td>Tidak</td><td>SUBMITTED</td><td>Status (SUBMITTED/IN_PROGRESS/RESOLVED/CLOSED)</td></tr>
            <tr><td><code>submitted_at</code></td><td>TIMESTAMP</td><td>Tidak</td><td>CURRENT_TIMESTAMP</td><td>Waktu pengiriman keluhan</td></tr>
            <tr><td><code>resolved_at</code></td><td>TIMESTAMP</td><td>Ya</td><td>NULL</td><td>Waktu penyelesaian keluhan</td></tr>
        </tbody>
    </table>

    <h2>2.7 Tabel Keuangan & General Ledger</h2>
    <ul>
        <li><strong>iuran_types:</strong> Master jenis iuran (<code>id</code>, <code>name</code>, <code>description</code>, <code>default_nominal</code>, <code>type</code>, <code>is_active</code>).</li>
        <li><strong>catatan_iuran_wargas:</strong> Pencatatan pembayaran iuran per KK (<code>iuran_id</code>, <code>no_kk</code>, <code>iuran_type_id</code>, <code>nominal</code>, <code>periode_bulan</code>, <code>periode_tahun</code>, <code>tanggal_pembayaran</code>, <code>recorded_by_user_id</code>, <code>approved_by_user_id</code>, status: <code>PENDING</code>/<code>APPROVED</code>/<code>REJECTED</code>, <code>payment_proof_path</code>).</li>
        <li><strong>financial_transactions:</strong> General Ledger Keuangan (<code>transaction_id</code>, <code>transaction_number</code>, <code>rt_code</code>, transaction_type: <code>INCOME</code>/<code>EXPENSE</code>, <code>category</code>, <code>amount</code>, <code>description</code>, <code>transaction_date</code>, <code>reference_type</code>, <code>reference_id</code>, <code>adjusted_transaction_id</code>, <code>adjusted_by_user_id</code>, <code>created_by_user_id</code>).</li>
    </ul>

    <h2>2.8 Tabel Hak Akses & System Audit Logs</h2>
    <ul>
        <li><strong>roles &amp; permissions:</strong> Tabel <code>roles</code> (role_id, role_name, description), <code>permissions</code> (permission_id, permission_name), dan tabel pivot <code>role_permissions</code>.</li>
        <li><strong>audit_logs &amp; activity_logs:</strong> Mencatat aktivitas krusial pengguna (user_id, entity_type, entity_id, action, old_value, new_value, ip_address, user_agent).</li>
    </ul>

    <div class="page-break"></div>

    <!-- BAGIAN 3 -->
    <h1 class="section-title">BAGIAN 3: PANDUAN PENGEMBANG & ARSITEKTUR KODE</h1>

    <h2>3.1 Struktur Direktori Utama Laravel</h2>
    <div class="card">
        <ul>
            <li><code>app/Http/Controllers/</code>: Terbagi menjadi Admin/, Auth/, Finance/, Portal/, serta Root Controllers.</li>
            <li><code>app/Services/</code>: Berisi 10+ kelas service pembawa logika bisnis (ComplaintService, ContributionService, LedgerService, LetterApprovalService, N8nService, WargaService, dll.).</li>
            <li><code>app/Repositories/</code>: Berisi kelas abstraksi query (ComplaintRepository, LetterRepository, WargaRepository, KartuKeluargaRepository, dll.).</li>
            <li><code>app/Models/</code>: Berisi 21 Eloquent Models terisolasi dengan relasi dan type casting.</li>
            <li><code>app/Enums/</code>: Berisi 13 Enum terdaftar untuk pembatasan tipe data status dan role.</li>
            <li><code>app/Policies/</code>: Berisi 11 Policy kelas otorisasi hak akses per model.</li>
            <li><code>routes/</code>: Tersusun rapi dalam web.php, auth.php, api.php, console.php, channels.php.</li>
        </ul>
    </div>

    <h2>3.2 Penjelasan 6 Modul Utama Aplikasi</h2>
    <ol>
        <li><strong>Modul Kependudukan:</strong> Mengelola KK dan warga (anggota keluarga) beserta permohonan ubah data kependudukan.</li>
        <li><strong>Modul Persuratan:</strong> Layanan pengajuan surat warga online dan alur verifikasi bertahap RT -&gt; RW.</li>
        <li><strong>Modul Laporan Aspirasi:</strong> Pengaduan warga publik, integrasi AI n8n, dan penugasan staf pengurus.</li>
        <li><strong>Modul Keuangan:</strong> Pengelolaan jenis iuran, verifikasi bukti bayar, dan pembukuan General Ledger.</li>
        <li><strong>Modul Admin Workspace:</strong> Manajemen pengguna, RBAC Matrix, konfigurasi sistem, dan audit trail.</li>
        <li><strong>Modul Portal Gateway Warga:</strong> Halaman publik terpadu (<code>/layanan</code>) yang ramah pengguna.</li>
    </ol>

    <h2>3.3 Pemetaan Layer Controller, Service, & Repository</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 18%;">Modul Sistem</th>
                <th style="width: 27%;">Controller Class</th>
                <th style="width: 27%;">Service Class</th>
                <th style="width: 28%;">Repository Class</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Persuratan</td><td>AdminLetterController / PublicLetterController</td><td>LetterApprovalService / LetterRequestService</td><td>LetterRepository / LetterHistoryRepository</td></tr>
            <tr><td>Pengaduan AI</td><td>ComplaintController / PublicComplaintController</td><td>ComplaintService / ComplaintAssignmentService / N8nService</td><td>ComplaintRepository / ComplaintHistoryRepository</td></tr>
            <tr><td>Keuangan</td><td>ContributionController / FinancialTransactionController</td><td>ContributionService / LedgerService</td><td>Polymorphic Query in LedgerService</td></tr>
            <tr><td>Kependudukan</td><td>WargaController / KartuKeluargaController</td><td>WargaService / KartuKeluargaService</td><td>WargaRepository / KartuKeluargaRepository</td></tr>
        </tbody>
    </table>

    <h2>3.4 Middleware Stack & Aliases</h2>
    <ul>
        <li><code>auth</code> (Authenticate): Memastikan pengguna telah login sebelum mengakses rute terproteksi.</li>
        <li><code>guest</code> (RedirectIfAuthenticated): Mencegah pengguna yang sudah login mengakses halaman login/register.</li>
        <li><code>can</code> (Authorize): Memeriksa izin/ability pengguna menggunakan Policy/Gate (misal: <code>can:manage_system</code>).</li>
        <li><code>verified</code> (EnsureEmailIsVerified): Memastikan alamat email pengguna telah terverifikasi.</li>
    </ul>

    <h2>3.5 Form Request Validation & Authorization Rules</h2>
    <p>Validasi input terisolasi pada kelas Form Request (<code>app/Http/Requests/</code>):</p>
    <ul>
        <li><code>StoreWargaRequest</code>: Validasi NIK 16 digit unique, no_kk exists, jenis_kelamin in:L,P, tanggal_lahir date.</li>
        <li><code>StoreKartuKeluargaRequest</code>: Validasi no_kk 16 digit unique, rt_code max:5, alamat_lengkap required.</li>
        <li><code>StoreComplaintRequest</code>: Validasi NIK warga, teks_keluhan min:10 karakter, attachments file max 5MB (jpg,png,pdf).</li>
        <li><code>SubmitContributionRequest</code>: Validasi no_kk, iuran_type_id, nominal numeric, periode_bulan 1-12.</li>
        <li><code>StoreTransactionRequest</code>: Validasi transaction_type (INCOME/EXPENSE), category enum, amount, transaction_date.</li>
    </ul>

    <h2>3.6 Autentikasi & Otorisasi RBAC Matrix</h2>
    <p>Pengurus login menggunakan cookie-session Breeze. API menggunakan Laravel Sanctum. Akses kontrol diatur via <code>RoleEnum</code> (SUPER_ADMIN, RW_ADMIN, RT_ADMIN, WARGA, AUDITOR) dan <code>PermissionEnum</code> yang diperiksa melalui <code>Gate::before</code> hook pada <code>AuthServiceProvider</code>.</p>

    <h2>3.7 Event, Listener, Queue & Integrasi AI (N8nService)</h2>
    <p>Event internal (<code>ComplaintSubmitted</code>, <code>LetterSubmitted</code>, <code>ComplaintStatusUpdated</code>, <code>LetterStatusUpdated</code>) didengar oleh Listener (<code>RecordComplaintActivity</code>, <code>RecordLetterAudit</code>, <code>CreateInternalNotification</code>). Integrasi AI dipicu secara asinkron via <code>N8nService</code> HTTP REST client.</p>

    <h2>3.8 Panduan Menjalankan Proyek (How to Run)</h2>
    <div class="card">
        <ol>
            <li><strong>Clone repo &amp; masuk direktori:</strong> <code>cd "versi 2"</code></li>
            <li><strong>Install dependensi PHP:</strong> <code>composer install</code></li>
            <li><strong>Install dependensi JS:</strong> <code>npm install</code></li>
            <li><strong>Salin environment:</strong> <code>cp .env.example .env</code> (sesuaikan DB_DATABASE)</li>
            <li><strong>Generate Key:</strong> <code>php artisan key:generate</code></li>
            <li><strong>Jalankan Migrasi &amp; Seeder:</strong> <code>php artisan migrate --seed</code></li>
            <li><strong>Symlink Storage:</strong> <code>php artisan storage:link</code></li>
            <li><strong>Menjalankan Server:</strong> <code>php artisan serve</code> (terminal 1) &amp; <code>npm run dev</code> (terminal 2)</li>
        </ol>
    </div>

    <h2>3.9 Panduan Menambah Fitur Baru (Step-by-Step Developer Guide)</h2>
    <pre><code>1. Buat Migration & Model:
   php artisan make:model Feature -m

2. Buat Enum / DTO jika diperlukan pada app/Enums/

3. Buat Repository pada app/Repositories/FeatureRepository.php

4. Buat Service pada app/Services/FeatureService.php dengan DB::transaction

5. Buat Form Request pada app/Http/Requests/StoreFeatureRequest.php

6. Buat Policy pada app/Policies/FeaturePolicy.php & daftarkan di AuthServiceProvider

7. Buat Controller pada app/Http/Controllers/FeatureController.php dengan Dependency Injection

8. Daftarkan Rute di routes/web.php & Buat Blade View di resources/views/</code></pre>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'dokumentasi.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log("HTML file saved to:", htmlPath);

(async () => {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

    const pdfPathFixed = path.join(__dirname, '..', 'RANGKUMAN_DOKUMENTASI_SIM_RW_FIXED.pdf');
    const pdfPathOverwrite = path.join(__dirname, '..', 'RANGKUMAN_DOKUMENTASI_SIM_RW.pdf');

    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
            top: '20mm',
            bottom: '22mm',
            left: '18mm',
            right: '18mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.5pt; color: #64748B; width: 100%; padding: 0 18mm; display: flex; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">
                <span><strong>DOKUMENTASI LENGKAP APLIKASI SIM RW 047</strong></span>
                <span style="color: #2563EB;">Bahan Persiapan Sidang Skripsi</span>
            </div>
        `,
        footerTemplate: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.5pt; color: #64748B; width: 100%; padding: 0 18mm; display: flex; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 4px;">
                <span>Sistem Informasi Manajemen RW 047 — Living Documentation & Reference</span>
                <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
            </div>
        `,
        printBackground: true
    });

    fs.writeFileSync(pdfPathFixed, pdfBuffer);
    fs.writeFileSync(pdfPathOverwrite, pdfBuffer);

    console.log("PDF files successfully generated:");
    console.log("1.", pdfPathFixed);
    console.log("2.", pdfPathOverwrite);

    await browser.close();
})();
