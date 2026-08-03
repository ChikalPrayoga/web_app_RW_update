const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'RANGKUMAN_DOKUMENTASI_SIM_RW.pdf');
const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    bufferPages: true,
    info: {
        Title: 'Dokumentasi Lengkap Aplikasi SIM RW (Bahan Persiapan Sidang Skripsi)',
        Author: 'Tim Pengembang / Antigravity AI',
        Subject: 'Dokumentasi Sistem Informasi Manajemen RW 047',
        Keywords: 'SIM RW, Laravel, Arsitektur, ERD, Migration, Developer Guide',
    }
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Color Palette
const COLORS = {
    primary: '#0F172A',      // Slate 900
    secondary: '#1E293B',    // Slate 800
    accent: '#2563EB',       // Blue 600
    accentLight: '#DBEAFE',  // Blue 100
    text: '#334155',         // Slate 700
    textMuted: '#64748B',    // Slate 500
    bgHeader: '#1E293B',
    bgAlt: '#F8FAFC',
    border: '#CBD5E1',
    calloutBg: '#EFF6FF',
    calloutBorder: '#3B82F6',
    white: '#FFFFFF',
    green: '#15803D',
    amber: '#B45309'
};

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 40;
const contentWidth = pageWidth - (margin * 2); // 515.28

// Helper: Ensure Y position, add new page if needed
function checkAddPage(doc, heightNeeded = 40) {
    if (doc.y + heightNeeded > pageHeight - 50) {
        doc.addPage();
    }
}

// Helper: Draw Section Banner / Heading 1
function drawHeading1(text) {
    checkAddPage(doc, 45);
    doc.moveDown(0.8);
    const startY = doc.y;
    
    // Background pill
    doc.rect(margin, startY, contentWidth, 26)
       .fill(COLORS.primary);
       
    doc.fillColor(COLORS.white)
       .font('Helvetica-Bold')
       .fontSize(13)
       .text(text.toUpperCase(), margin + 10, startY + 6, { width: contentWidth - 20 });
       
    doc.y = startY + 32;
    doc.fillColor(COLORS.text);
}

// Helper: Draw Heading 2
function drawHeading2(text) {
    checkAddPage(doc, 35);
    doc.moveDown(0.5);
    const startY = doc.y;
    
    doc.fillColor(COLORS.accent)
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(text, margin, startY);
       
    doc.strokeColor(COLORS.accent)
       .lineWidth(1)
       .moveTo(margin, doc.y + 2)
       .lineTo(margin + contentWidth, doc.y + 2)
       .stroke();
       
    doc.y = doc.y + 6;
    doc.fillColor(COLORS.text);
}

// Helper: Draw Heading 3
function drawHeading3(text) {
    checkAddPage(doc, 25);
    doc.moveDown(0.4);
    doc.fillColor(COLORS.secondary)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(text, margin, doc.y);
    doc.moveDown(0.2);
    doc.fillColor(COLORS.text);
}

// Helper: Paragraph
function drawParagraph(text) {
    checkAddPage(doc, 20);
    doc.font('Helvetica')
       .fontSize(8.5)
       .fillColor(COLORS.text)
       .text(text, { align: 'justify', lineGap: 2.5 });
    doc.moveDown(0.3);
}

// Helper: Bullet item
function drawBullet(title, desc = '') {
    checkAddPage(doc, 18);
    const startY = doc.y;
    doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(8.5).text('• ', margin + 5, startY, { continued: true });
    doc.fillColor(COLORS.secondary).font('Helvetica-Bold').text(title + (desc ? ': ' : ''), { continued: !!desc });
    if (desc) {
        doc.fillColor(COLORS.text).font('Helvetica').text(desc);
    } else {
        doc.text('');
    }
    doc.moveDown(0.15);
}

// Helper: Callout Box
function drawCallout(title, text, type = 'info') {
    checkAddPage(doc, 50);
    doc.moveDown(0.3);
    const startY = doc.y;
    
    let bgColor = COLORS.calloutBg;
    let borderColor = COLORS.calloutBorder;
    if (type === 'success') {
        bgColor = '#F0FDF4';
        borderColor = COLORS.green;
    } else if (type === 'warning') {
        bgColor = '#FFFBEB';
        borderColor = COLORS.amber;
    }
    
    // Calculate box height roughly
    doc.font('Helvetica').fontSize(8);
    const textHeight = doc.heightOfString(text, { width: contentWidth - 25 });
    const boxHeight = Math.max(30, textHeight + 18);
    
    doc.rect(margin, startY, contentWidth, boxHeight).fill(bgColor);
    doc.rect(margin, startY, 4, boxHeight).fill(borderColor);
    
    doc.fillColor(borderColor)
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(title, margin + 12, startY + 5);
       
    doc.fillColor(COLORS.text)
       .font('Helvetica')
       .fontSize(8)
       .text(text, margin + 12, startY + 16, { width: contentWidth - 25, align: 'left' });
       
    doc.y = startY + boxHeight + 6;
}

// Helper: Render Table
function drawTable(headers, rows, colWidths = []) {
    if (colWidths.length === 0) {
        const defaultWidth = contentWidth / headers.length;
        colWidths = headers.map(() => defaultWidth);
    }
    
    checkAddPage(doc, 35);
    let startY = doc.y + 4;
    
    // Header Row
    doc.rect(margin, startY, contentWidth, 18).fill(COLORS.bgHeader);
    
    let currentX = margin;
    doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8);
    headers.forEach((h, idx) => {
        doc.text(h, currentX + 4, startY + 4, { width: colWidths[idx] - 8, align: 'left' });
        currentX += colWidths[idx];
    });
    
    startY += 18;
    doc.font('Helvetica').fontSize(7.5);
    
    rows.forEach((row, rowIndex) => {
        // Calculate max row height
        let maxRowHeight = 16;
        row.forEach((cell, idx) => {
            const cellHeight = doc.heightOfString(String(cell), { width: colWidths[idx] - 8 }) + 6;
            if (cellHeight > maxRowHeight) maxRowHeight = cellHeight;
        });
        
        if (startY + maxRowHeight > pageHeight - 45) {
            doc.addPage();
            startY = margin;
            
            // Re-draw header on new page
            doc.rect(margin, startY, contentWidth, 18).fill(COLORS.bgHeader);
            let cx = margin;
            doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8);
            headers.forEach((h, idx) => {
                doc.text(h, cx + 4, startY + 4, { width: colWidths[idx] - 8, align: 'left' });
                cx += colWidths[idx];
            });
            startY += 18;
            doc.font('Helvetica').fontSize(7.5);
        }
        
        // Row background
        const bg = (rowIndex % 2 === 0) ? COLORS.white : COLORS.bgAlt;
        doc.rect(margin, startY, contentWidth, maxRowHeight).fill(bg);
        doc.rect(margin, startY, contentWidth, maxRowHeight).strokeColor(COLORS.border).lineWidth(0.5).stroke();
        
        let cx = margin;
        doc.fillColor(COLORS.text);
        row.forEach((cell, idx) => {
            doc.text(String(cell), cx + 4, startY + 4, { width: colWidths[idx] - 8, align: 'left' });
            cx += colWidths[idx];
        });
        
        startY += maxRowHeight;
    });
    
    doc.y = startY + 6;
    doc.fillColor(COLORS.text);
}

// --- COVER PAGE ---
doc.rect(0, 0, pageWidth, pageHeight).fill(COLORS.primary);

// Header Graphic Box
doc.rect(margin, 80, contentWidth, 200).fill('#1E293B');
doc.rect(margin + 20, 100, 6, 160).fill(COLORS.accent);

doc.fillColor(COLORS.white)
   .font('Helvetica-Bold')
   .fontSize(22)
   .text('DOKUMENTASI LENGKAP APLIKASI SIM RW', margin + 40, 110, { width: contentWidth - 60 });

doc.fillColor(COLORS.accentLight)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('Bahan Persiapan Sidang Skripsi (Living Documentation & Reference)', margin + 40, 165, { width: contentWidth - 60 });

doc.fillColor('#94A3B8')
   .font('Helvetica')
   .fontSize(9.5)
   .text('Sistem Informasi Manajemen Rukun Warga 047 (SIM RW 047)\nIntegrasi Arsitektur Kode, Diagram Sistem, dan Referensi Migration Database', margin + 40, 210, { width: contentWidth - 60 });

// Metadata Box
doc.rect(margin, 310, contentWidth, 140).fill('#020617');
doc.rect(margin, 310, contentWidth, 140).strokeColor(COLORS.accent).lineWidth(1).stroke();

doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(10).text('METADATA DOKUMEN & APLIKASI', margin + 20, 325);
doc.fillColor('#94A3B8').font('Helvetica').fontSize(8.5);

const metaData = [
    ['Nama Aplikasi', 'Aplikasi SIM RW 047 (Versi 2.0)'],
    ['Framework Utama', 'Laravel 10.x (PHP 8.1+) & Vite / TailwindCSS / Alpine.js'],
    ['Architecture Pattern', 'Controller-Service-Repository + Event-Driven Architecture'],
    ['Integrasi Eksternal', 'n8n Workflow Engine (AI Enhancement Layer)'],
    ['Database Engine', 'MySQL / MariaDB (Soft Deletes, Polymorphic Relations, Audit Logs)'],
    ['Tanggal Pembuatan', '24 Juli 2026'],
    ['Tujuan Dokumen', 'Panduan Arsitektur Teknis & Material Presentasi Sidang Skripsi']
];

let metaY = 345;
metaData.forEach(([label, val]) => {
    doc.fillColor(COLORS.accentLight).font('Helvetica-Bold').text(label + ':', margin + 20, metaY, { width: 140 });
    doc.fillColor(COLORS.white).font('Helvetica').text(val, margin + 160, metaY, { width: 310 });
    metaY += 14;
});

// Footer Cover
doc.fillColor('#64748B').font('Helvetica-Oblique').fontSize(8).text('Disusun secara terintegrasi berdasarkan analisis kode sumber & berkas migrasi repository.', margin, pageHeight - 60, { align: 'center', width: contentWidth });

// --- PAGE 2: TABLE OF CONTENTS ---
doc.addPage();

drawHeading1('DAFTAR ISI RINGKAS DOKUMENTASI');

drawParagraph('Dokumen ini merupakan penggabungan dan rangkuman komprehensif dari tiga berkas utama: SYSTEM_ARCHITECTURE_AND_DIAGRAMS.md, MIGRATION_REFERENCE.md, dan DEVELOPER_DOCUMENTATION.md.');

const tocItems = [
    ['BAGIAN 1: ARSITEKTUR & DIAGRAM SISTEM', 'Halaman 2'],
    ['   1.1 Gambaran Umum & Pola Arsitektur (Controller-Service-Repository)', 'Halaman 2'],
    ['   1.2 High-Level Architecture & Integrasi Component', 'Halaman 2'],
    ['   1.3 Diagram Kasus Penggunaan (Use Case Diagram & Identifikasi Aktor)', 'Halaman 3'],
    ['   1.4 Diagram Aktivitas (Activity Diagram: Surat, Keluhan AI, Iuran Ledger)', 'Halaman 3'],
    ['   1.5 Diagram Urutan (Sequence Diagram: Process Approval & Auto Ledger)', 'Halaman 4'],
    ['   1.6 Diagram Kelas (Class Diagram Architecture)', 'Halaman 4'],
    ['   1.7 Entity Relationship Diagram (ERD & Cardinality Rules)', 'Halaman 5'],
    ['   1.8 Alur Bisnis & Aturan Sistem (RBAC, General Ledger, AI Fault Tolerance)', 'Halaman 5'],
    ['', ''],
    ['BAGIAN 2: STRUKTUR BASIS DATA & REFERENSI MIGRATION', 'Halaman 6'],
    ['   2.1 Ringkasan Migration Repository', 'Halaman 6'],
    ['   2.2 Tabel users (User Accounts & System Access)', 'Halaman 6'],
    ['   2.3 Tabel kartu_keluargas (Data Kartu Keluarga)', 'Halaman 6'],
    ['   2.4 Tabel anggota_keluargas / warga (Data Induk Kependudukan)', 'Halaman 7'],
    ['   2.5 Tabel pengajuan_surats (Persuratan & Approval Workflow)', 'Halaman 7'],
    ['   2.6 Tabel log_laporan_aspirasis (Pengaduan & Fields AI)', 'Halaman 8'],
    ['   2.7 Tabel Keuangan (catatan_iuran_wargas, financial_transactions, iuran_types)', 'Halaman 8'],
    ['   2.8 Tabel Hak Akses & System Logs (roles, permissions, audit_logs)', 'Halaman 9'],
    ['', ''],
    ['BAGIAN 3: PANDUAN PENGEMBANG & ARSITEKTUR KODE', 'Halaman 10'],
    ['   3.1 Struktur Direktori Project Laravel', 'Halaman 10'],
    ['   3.2 Penjelasan 6 Modul Utama Aplikasi SIM RW', 'Halaman 10'],
    ['   3.3 Arsitektur Kode (Controller, Service, Repository Roles)', 'Halaman 11'],
    ['   3.4 Middleware Stack & Aliases', 'Halaman 11'],
    ['   3.5 Pemetaan Rute (web.php, auth.php, api.php)', 'Halaman 12'],
    ['   3.6 Form Request Validation & System Authorization Rules', 'Halaman 12'],
    ['   3.7 Autentikasi & Otorisasi RBAC Matrix', 'Halaman 13'],
    ['   3.8 Event, Listener, Queue & Integrasi AI (N8nService)', 'Halaman 13'],
    ['   3.9 Konfigurasi Variable Environment (.env)', 'Halaman 14'],
    ['   3.10 Panduan Menjalankan Proyek (How to Run)', 'Halaman 14'],
    ['   3.11 Panduan Menambah Fitur Baru (Step-by-Step Developer Guide)', 'Halaman 14']
];

drawTable(['Judul Bab / Sub-bab', 'Referensi Navigasi'], tocItems, [380, 135.28]);

// ==========================================
// BAGIAN 1: ARSITEKTUR & DIAGRAM SISTEM
// ==========================================
drawHeading1('BAGIAN 1: ARSITEKTUR & DIAGRAM SISTEM');

drawHeading2('1.1 Gambaran Umum & Pola Arsitektur');
drawParagraph('Aplikasi SIM RW 047 menerapkan pola arsitektur Controller-Service-Repository yang memperluas arsitektur standar MVC (Model-View-Controller) milik Laravel. Pola ini memisahkan tanggung jawab sistem secara tegas (Separation of Concerns):');

drawBullet('Presentation Layer (View & Controller)', 'Blade Template + TailwindCSS + Alpine.js mengelola antarmuka. Controller menangani HTTP Request, memvalidasi input via Form Request, dan memeriksa otorisasi Policy.');
drawBullet('Domain & Business Logic Layer (Services)', 'Mengenkapsulasi logika bisnis utama, mengelola transaksi database (DB::transaction), menyimpan berkas upload, memicu Event internal, dan mengintegrasikan AI via HTTP REST API.');
drawBullet('Data Access Layer (Repositories & Models)', 'Mengabstraksi query database Eloquent (eager loading, pagination, search filter) dan pemetaan tabel relational MySQL.');

drawHeading2('1.2 High-Level Architecture');
drawParagraph('Arsitektur tingkat tinggi SIM RW 047 menghubungkan pengguna publik/pengurus melalui Laravel Web Server Engine menuju Layer Layanan & Integrasi AI n8n eksternal:');

drawBullet('Client Layer', 'Warga mengakses Portal Publik (layanan tanpa login NIK/No.KK). Pengurus RT/RW & Admin mengakses Dashboard Terproteksi.');
drawBullet('Laravel Core Engine', 'Router -> Middleware Stack (Auth, CSRF, Role) -> Authorization Policy -> Form Request -> Controller -> Service & Repository -> Eloquent Models.');
drawBullet('Integration Layer', 'n8n Workflow Engine berkomunikasi via REST API (N8nService) untuk kategorisasi keluhan warga, estimasi prioritas, dan pembuat ringkasan otomatis.');
drawBullet('Data Storage', 'Database MySQL (Relational Tables, Soft Deletes, Audit Trail) & Storage Lokal (Berkas Surat & Lampiran Keluhan).');

drawHeading2('1.3 Diagram Kasus Penggunaan (Use Case Diagram & Identifikasi Aktor)');
drawParagraph('Sistem mengidentifikasi 5 aktor utama dengan batasan hak akses yang jelas:');

drawBullet('Warga (Public Portal)', 'Dapat mengajukan surat keterangan, melacak status pengajuan, mengirim laporan keluhan/aspirasi, melacak keluhan, serta melihat transparansi keuangan & konfirmasi iuran.');
drawBullet('Ketua RT (Pengurus RT)', 'Mengelola data KK & warga lingkup RT, memverifikasi pengajuan surat tahap 1 (PROCESSED_RT), memproses keluhan, dan mencatat iuran.');
drawBullet('Ketua RW (Pengurus RW)', 'Mengelola data KK/warga seluruh RW, memberikan approval akhir surat (COMPLETED + Nomor Surat), memproses/menugaskan keluhan, serta mengelola kas RW.');
drawAdminInfo();

function drawAdminInfo() {
    drawBullet('Super Admin', 'Akses penuh (manage_system), manajemen akun user, matriks role/permission, konfigurasi sistem, dan pemantauan log audit.');
    drawBullet('Auditor', 'Akses pembacaan (read-only) laporan keuangan dan log audit sistem.');
}

drawTable(
    ['ID Use Case', 'Nama Use Case', 'Aktor Utama', 'Deskripsi Singkat'],
    [
        ['UC-01', 'Mengajukan Surat Keterangan', 'Warga', 'Warga mengisi form pengajuan surat online dengan NIK & keperluan'],
        ['UC-02', 'Melacak Status Pengajuan Surat', 'Warga', 'Melacak perkembangan status surat via NIK / kode tracking'],
        ['UC-03', 'Mengirim Laporan Aspirasi', 'Warga', 'Pengiriman keluhan publik + lampiran berkas pendukung'],
        ['UC-04', 'Melihat Transparansi Keuangan', 'Warga', 'Akses terbuka laporan kas RW dan riwayat iuran keluarga'],
        ['UC-05', 'Verifikasi Surat Tahap RT', 'Ketua RT', 'Pemeriksaan awal pengajuan surat oleh pengurus RT'],
        ['UC-06', 'Approval Akhir Surat Tahap RW', 'Ketua RW', 'Persetujuan akhir, generasi nomor surat resmi, dan penyelesaian'],
        ['UC-07', 'Delegasi & Penanganan Keluhan', 'Pengurus RT/RW', 'Penugasan staf/pengurus untuk penyelesaian keluhan lapangan'],
        ['UC-08', 'Verifikasi & Auto Ledger Iuran', 'Pengurus Keuangan', 'Persetujuan iuran warga & otomatisasi posting ke General Ledger'],
        ['UC-09', 'Manajemen User & RBAC Matrix', 'Super Admin', 'Pengaturan akun, peranan (role), izin (permission), dan audit log']
    ],
    [55, 135, 95, 230.28]
);

drawHeading2('1.4 Diagram Aktivitas (Activity Diagram)');

drawHeading3('A. Activity Diagram: Pengajuan & Persetujuan Surat Keterangan');
drawParagraph('Warga mengajukan surat di portal (/layanan/surat) -> Form Request memvalidasi input -> Sistem menyimpan record (status: SUBMITTED) -> Event LetterSubmitted dipicu -> Pengurus RT memverifikasi (PROCESSED_RT / REJECTED) -> Pengurus RW menyetujui (COMPLETED + Nomor Surat) -> Warga/Pengurus mengunduh surat.');

drawHeading3('B. Activity Diagram: Pengaduan Warga & AI Enhancement (n8n)');
drawParagraph('Warga mengirim keluhan + berkas di /layanan/laporan -> Simpan LogLaporanAspirasi & ComplaintAttachment -> Dispatch Event ComplaintSubmitted -> N8nService memanggil webhook n8n secara asinkron -> n8n mengembalikan ai_category, ai_priority, ai_summary -> Pengurus menerima keluhan terstruktur -> Delegasi ke staf -> Status RESOLVED.');

drawHeading3('C. Activity Diagram: Pembayaran Iuran & Auto General Ledger Posting');
drawParagraph('Warga/Pengurus mengunggah bukti bayar iuran -> Record CatatanIuranWarga (status: PENDING) -> Pengurus Keuangan meninjau bukti -> Jika disetujui (APPROVED), LedgerService secara otomatis membuat record FinancialTransaction (INCOME) yang terhubung via Morphic Reference ke catatan iuran -> Saldo & laporan transparansi publik terbarui.');

drawHeading2('1.5 Diagram Urutan (Sequence Diagram)');

drawHeading3('Sequence 1: Pengajuan Surat & Multi-Stage Approval');
drawParagraph('Interaksi Komponen: Warga -> Router -> StoreLetterRequest -> PublicLetterController -> LetterRequestService -> LetterRepository -> PengajuanSurat Model -> DB MySQL. Pada tahap approval: Pengurus -> AdminLetterController -> LetterApprovalService -> PengajuanSurat Model (Update Status) -> LetterStatusHistory Model (Insert History).');

drawHeading3('Sequence 2: Verifikasi Iuran & Auto Ledger Posting');
drawParagraph('Interaksi Komponen: Pengurus Keuangan -> Router -> PaymentVerificationController -> ContributionService -> CatatanIuranWarga Model (Update APPROVED) -> LedgerService -> FinancialTransaction Model (Insert INCOME) -> DB MySQL (Commit Transaction).');

drawHeading2('1.6 Diagram Kelas (Class Diagram Architecture)');
drawParagraph('Kelas-kelas dalam aplikasi SIM RW 047 saling terhubung dengan pola Dependency Injection:');

drawBullet('Controller Layer', 'AdminLetterController, PublicLetterController, ComplaintController, PaymentVerificationController, FinancialTransactionController.');
drawBullet('Service Layer', 'LetterRequestService, LetterApprovalService, ComplaintService, ContributionService, LedgerService, N8nService.');
drawBullet('Repository Layer', 'LetterRepository, ComplaintRepository, WargaRepository, KartuKeluargaRepository.');
drawBullet('Model Layer', 'User, AnggotaKeluarga, KartuKeluarga, PengajuanSurat, LogLaporanAspirasi, CatatanIuranWarga, FinancialTransaction.');

drawHeading2('1.7 Entity Relationship Diagram (ERD & Cardinalities)');
drawParagraph('Relasi antar entitas utama pada database SIM RW 047:');

drawBullet('roles (1) <---> (N) users', 'Setiap user memiliki satu role_id (opsional).');
drawBullet('roles (N) <---> (M) permissions', 'Dihubungkan via tabel pivot role_permissions.');
drawBullet('kartu_keluargas (1) <---> (N) anggota_keluargas', 'Satu KK memuat banyak anggota keluarga (warga). Foreign key no_kk dengan CASCADE delete.');
drawBullet('anggota_keluargas (1) <---> (N) pengajuan_surats', 'Satu warga dapat mengajukan banyak surat.');
drawBullet('anggota_keluargas (1) <---> (N) log_laporan_aspirasis', 'Satu warga dapat mengirimkan banyak laporan keluhan.');
drawBullet('kartu_keluargas (1) <---> (N) catatan_iuran_wargas', 'Setiap catatan iuran terikat pada satu no_kk.');
drawBullet('catatan_iuran_wargas (1) <---> (1) financial_transactions', 'Relasi Polimorfik (morphOne) di mana transaksi keuangan mencatat referensi iuran.');
drawBullet('financial_transactions (1) <---> (1) financial_transactions', 'Self-referencing relationship (adjusted_transaction_id) untuk koreksi/reversal transaksi.');

drawHeading2('1.8 Alur Bisnis & Aturan Sistem (Business Logic & System Rules)');

drawCallout('ATURAN OTORISASI RBAC', '1. Super Admin memiliki akses mutlak (bypass full) via hasPermissionTo().\n2. Ketua RT terbatas pada data kependudukan & verifikasi tahap 1 di wilayah RT-nya.\n3. Ketua RW memiliki wewenang seluruh RT di lingkup RW dan persetujuan akhir surat.\n4. Warga publik dapat mengakses layanan tanpa login via verifikasi NIK/No.KK.', 'info');

drawCallout('ATURAN GENERAL LEDGER & IMMUTABILITY', 'Setiap transaksi pada financial_transactions bersifat immutable (tidak boleh di-hard delete atau di-update langsung). Koreksi kesalahan transaksi wajib dilakukan melalui mekanisme Reversal/Adjustment yang membuat transaksi pembalik baru.', 'warning');

drawCallout('ATURAN FAULT-TOLERANT INTEGRASI AI', 'Integrasi AI (n8n Workflow Engine) bersifat Enhancement Layer non-blocking. Apabila server n8n mengalami timeout atau offline, proses pengajuan keluhan warga tetap berjalan lancar dan disimpan ke database dengan nilai kolom AI bernilai NULL.', 'success');


// ==========================================
// BAGIAN 2: STRUKTUR BASIS DATA & MIGRATION
// ==========================================
drawHeading1('BAGIAN 2: STRUKTUR BASIS DATA & REFERENSI MIGRATION');

drawParagraph('Seluruh struktur basis data SIM RW 047 dirancang menggunakan file Migration Laravel yang menjamin konsistensi skema dan integritas data.');

drawHeading2('2.1 Ringkasan Migration Repository');
drawTable(
    ['No', 'Tabel yang Diminta', 'Tabel Migration', 'File Migration Laravel', 'Status Repository'],
    [
        ['1', 'users', 'users', '2014_10_12_000000_create_users_table.php', 'Ditemukan'],
        ['2', 'kartu_keluarga', 'kartu_keluargas', '2026_06_10_062643_create_kartu_keluargas_table.php', 'Ditemukan'],
        ['3', 'warga', 'anggota_keluargas', '2026_06_10_062644_create_anggota_keluargas_table.php', 'Ditemukan (sebagai anggota_keluargas)'],
        ['4', 'pengajuan_surat', 'pengajuan_surats', '2026_06_11_184552_create_pengajuan_surats_table.php', 'Ditemukan'],
        ['5', 'laporan_aspirasi', 'log_laporan_aspirasis', '2026_06_10_085707_create_log_laporan_aspirasis_table.php', 'Ditemukan']
    ],
    [25, 95, 105, 185, 105.28]
);

drawHeading2('2.2 Tabel: users');
drawParagraph('Menyimpan data akun pengguna/pengurus sistem yang terikat dengan peran (role) dan mendukung soft delete.');

drawTable(
    ['Kolom', 'Tipe Data', 'Nullable', 'Default', 'Keterangan & Foreign Key'],
    [
        ['user_id', 'BIGINT UNSIGNED', 'Tidak', 'Auto Increment', 'Primary Key ($table->id())'],
        ['role_id', 'BIGINT UNSIGNED', 'Ya', 'NULL', 'Foreign Key ke roles(role_id), onDelete: SET NULL'],
        ['username', 'VARCHAR(255)', 'Tidak', '—', 'Unique constraint'],
        ['email', 'VARCHAR(255)', 'Tidak', '—', 'Unique constraint'],
        ['email_verified_at', 'TIMESTAMP', 'Ya', 'NULL', 'Waktu verifikasi email'],
        ['password', 'VARCHAR(255)', 'Tidak', '—', 'Hash password terenkripsi'],
        ['full_name', 'VARCHAR(255)', 'Tidak', '—', 'Nama lengkap pengguna'],
        ['phone_number', 'VARCHAR(255)', 'Ya', 'NULL', 'Nomor telepon'],
        ['status', 'ENUM', 'Tidak', 'ACTIVE', 'Nilai: ACTIVE, INACTIVE'],
        ['last_login_at', 'TIMESTAMP', 'Ya', 'NULL', 'Waktu login terakhir'],
        ['remember_token', 'VARCHAR(100)', 'Ya', 'NULL', 'Token remember me Laravel'],
        ['created_at / updated_at', 'TIMESTAMP', 'Ya', 'NULL', 'Otomatis dari $table->timestamps()'],
        ['deleted_at', 'TIMESTAMP', 'Ya', 'NULL', 'Soft delete ($table->softDeletes())']
    ],
    [105, 90, 45, 65, 210.28]
);

drawHeading2('2.3 Tabel: kartu_keluargas');
drawParagraph('Menyimpan data induk Kartu Keluarga (KK) dengan primary key natural no_kk (16 digit).');

drawTable(
    ['Kolom', 'Tipe Data', 'Nullable', 'Default', 'Keterangan'],
    [
        ['no_kk', 'VARCHAR(16)', 'Tidak', '—', 'Primary Key (Natural Key 16 digit)'],
        ['rt_code', 'VARCHAR(5)', 'Tidak', '—', 'Kode RT wilayah'],
        ['alamat_lengkap', 'TEXT', 'Tidak', '—', 'Alamat lengkap tempat tinggal'],
        ['blok', 'VARCHAR(10)', 'Ya', 'NULL', 'Blok rumah'],
        ['nomor_rumah', 'VARCHAR(10)', 'Ya', 'NULL', 'Nomor rumah'],
        ['status_kepemilikan_rumah', 'VARCHAR(50)', 'Ya', 'NULL', 'Status kepemilikan (Milik Sendiri/Sewa/dll)'],
        ['created_at / updated_at', 'TIMESTAMP', 'Ya', 'NULL', 'Timestamps Laravel'],
        ['deleted_at', 'TIMESTAMP', 'Ya', 'NULL', 'Soft delete']
    ],
    [125, 85, 45, 55, 205.28]
);

drawHeading2('2.4 Tabel: anggota_keluargas (Representasi Tabel Warga)');
drawParagraph('Menyimpan data individu warga yang merupakan anggota KK. Menggunakan nik (16 digit) sebagai primary key.');

drawTable(
    ['Kolom', 'Tipe Data', 'Nullable', 'Default', 'Keterangan & Relasi'],
    [
        ['nik', 'VARCHAR(16)', 'Tidak', '—', 'Primary Key (Natural Key NIK 16 digit)'],
        ['no_kk', 'VARCHAR(16)', 'Tidak', '—', 'Foreign Key ke kartu_keluargas(no_kk), onDelete: CASCADE'],
        ['nama_lengkap', 'VARCHAR(255)', 'Tidak', '—', 'Nama lengkap warga'],
        ['jenis_kelamin', 'ENUM', 'Tidak', '—', 'Nilai ENUM: L (Laki-laki), P (Perempuan)'],
        ['tempat_lahir', 'VARCHAR(255)', 'Tidak', '—', 'Tempat lahir'],
        ['tanggal_lahir', 'DATE', 'Tidak', '—', 'Tanggal lahir'],
        ['pekerjaan', 'VARCHAR(255)', 'Ya', 'NULL', 'Pekerjaan warga'],
        ['nomor_hp', 'VARCHAR(20)', 'Ya', 'NULL', 'Nomor kontak HP'],
        ['status_hubungan_keluarga', 'VARCHAR(50)', 'Tidak', '—', 'Kepala Keluarga / Istri / Anak / dll'],
        ['status_sosio_ekonomi', 'VARCHAR(50)', 'Ya', 'NULL', 'Status ekonomi warga'],
        ['status_warga', 'VARCHAR(50)', 'Tidak', 'AKTIF', 'Status kependudukan (AKTIF/PINDAH/MENINGGAL)'],
        ['created_at / updated_at', 'TIMESTAMP', 'Ya', 'NULL', 'Timestamps Laravel'],
        ['deleted_at', 'TIMESTAMP', 'Ya', 'NULL', 'Soft delete']
    ],
    [125, 85, 45, 55, 205.28]
);

drawHeading2('2.5 Tabel: pengajuan_surats');
drawParagraph('Menyimpan data permohonan surat keterangan oleh warga beserta alur status persetujuan.');

drawTable(
    ['Kolom', 'Tipe Data', 'Nullable', 'Default', 'Keterangan & Relasi'],
    [
        ['pengajuan_id', 'BIGINT UNSIGNED', 'Tidak', 'Auto Increment', 'Primary Key ($table->id())'],
        ['nik', 'VARCHAR(16)', 'Tidak', '—', 'Foreign Key ke anggota_keluargas(nik), onDelete: CASCADE'],
        ['nomor_surat', 'VARCHAR(100)', 'Ya', 'NULL', 'Nomor surat resmi (diisi saat status COMPLETED)'],
        ['jenis_surat', 'VARCHAR(50)', 'Tidak', '—', 'Tipe surat (LetterTypeEnum)'],
        ['keperluan', 'TEXT', 'Tidak', '—', 'Uraian keperluan pengajuan surat'],
        ['current_status', 'VARCHAR(50)', 'Tidak', 'SUBMITTED', 'Status pengajuan (SUBMITTED/PROCESSED_RT/COMPLETED/REJECTED)'],
        ['tanggal_pengajuan', 'TIMESTAMP', 'Tidak', 'CURRENT_TIMESTAMP', 'Waktu pembuatan pengajuan (useCurrent())'],
        ['tanggal_selesai', 'TIMESTAMP', 'Ya', 'NULL', 'Waktu penyelesaian surat'],
        ['deleted_at', 'TIMESTAMP', 'Ya', 'NULL', 'Soft delete']
    ],
    [115, 95, 40, 75, 190.28]
);

drawHeading2('2.6 Tabel: log_laporan_aspirasis');
drawParagraph('Menyimpan data laporan pengaduan/aspirasi warga yang dilengkapi dengan kolom hasil analisis AI n8n.');

drawTable(
    ['Kolom', 'Tipe Data', 'Nullable', 'Default', 'Keterangan & Field AI'],
    [
        ['aspirasi_id', 'BIGINT UNSIGNED', 'Tidak', 'Auto Increment', 'Primary Key ($table->id())'],
        ['nik', 'VARCHAR(16)', 'Tidak', '—', 'Foreign Key ke anggota_keluargas(nik), onDelete: CASCADE'],
        ['kanal_laporan', 'VARCHAR(50)', 'Tidak', 'WEB', 'Kanal pengiriman (WEB/APP)'],
        ['teks_keluhan', 'TEXT', 'Tidak', '—', 'Isi pengaduan/aspirasi warga'],
        ['ai_category', 'VARCHAR(50)', 'Ya', 'NULL', 'Kategori otomatis hasil analisis AI'],
        ['ai_priority', 'VARCHAR(50)', 'Ya', 'NULL', 'Prioritas keluhan (LOW/MEDIUM/HIGH/CRITICAL)'],
        ['ai_summary', 'TEXT', 'Ya', 'NULL', 'Ringkasan singkat dari AI'],
        ['ai_confidence', 'DECIMAL(5,2)', 'Ya', 'NULL', 'Skor kepercayaan AI (0.00-100.00)'],
        ['current_status', 'VARCHAR(50)', 'Tidak', 'SUBMITTED', 'Status keluhan (SUBMITTED/IN_PROGRESS/RESOLVED/CLOSED)'],
        ['submitted_at', 'TIMESTAMP', 'Tidak', 'CURRENT_TIMESTAMP', 'Waktu pengiriman keluhan'],
        ['resolved_at', 'TIMESTAMP', 'Ya', 'NULL', 'Waktu penyelesaian keluhan']
    ],
    [115, 95, 40, 75, 190.28]
);

drawHeading2('2.7 Tabel Keuangan & General Ledger');
drawBullet('iuran_types', 'Master jenis iuran (id, name, description, default_nominal, type, is_active).');
drawBullet('catatan_iuran_wargas', 'Pencatatan pembayaran iuran per KK (iuran_id, no_kk, iuran_type_id, nominal, periode_bulan, periode_tahun, tanggal_pembayaran, recorded_by_user_id, approved_by_user_id, status: PENDING/APPROVED/REJECTED, payment_proof_path).');
drawBullet('financial_transactions', 'General Ledger Keuangan (transaction_id, transaction_number, rt_code, transaction_type: INCOME/EXPENSE, category, amount, description, transaction_date, reference_type, reference_id, adjusted_transaction_id, adjusted_by_user_id, created_by_user_id).');

drawHeading2('2.8 Tabel Hak Akses & System Audit Logs');
drawBullet('roles & permissions', 'Tabel roles (role_id, role_name, description), permissions (permission_id, permission_name), dan tabel pivot role_permissions.');
drawBullet('audit_logs & activity_logs', 'Mencatat aktivitas krusial pengguna (user_id, entity_type, entity_id, action, old_value, new_value, ip_address, user_agent).');


// ==========================================
// BAGIAN 3: PANDUAN PENGEMBANG & ARSITEKTUR KODE
// ==========================================
drawHeading1('BAGIAN 3: PANDUAN PENGEMBANG & ARSITEKTUR KODE');

drawHeading2('3.1 Struktur Direktori Utama Laravel');
drawBullet('app/Http/Controllers/', 'Terbagi menjadi Admin/, Auth/, Finance/, Portal/, serta Root Controllers.');
drawBullet('app/Services/', 'Berisi 10+ kelas service pembawa logika bisnis (ComplaintService, ContributionService, LedgerService, LetterApprovalService, N8nService, WargaService, dll.).');
drawBullet('app/Repositories/', 'Berisi kelas abstraksi query (ComplaintRepository, LetterRepository, WargaRepository, KartuKeluargaRepository, dll.).');
drawBullet('app/Models/', 'Berisi 21 Eloquent Models terisolasi dengan relasi dan type casting.');
drawBullet('app/Enums/', 'Berisi 13 Enum terdaftar untuk pembatasan tipe data status dan role.');
drawBullet('app/Policies/', 'Berisi 11 Policy kelas otorisasi hak akses per model.');
drawBullet('routes/', 'Tersusun rapi dalam web.php, auth.php, api.php, console.php, channels.php.');

drawHeading2('3.2 Penjelasan 6 Modul Utama Aplikasi');
drawParagraph('1. Modul Kependudukan: Mengelola KK dan warga (anggota keluarga) beserta permohonan ubah data.\n2. Modul Persuratan: Layanan pengajuan surat warga online dan alur verifikasi bertahap RT -> RW.\n3. Modul Laporan Aspirasi: Pengaduan warga publik, integrasi AI n8n, dan penugasan staf pengurus.\n4. Modul Keuangan: Pengelolaan jenis iuran, verifikasi bukti bayar, dan pembukuan General Ledger.\n5. Modul Admin Workspace: Manajemen pengguna, RBAC Matrix, konfigurasi sistem, dan audit trail.\n6. Modul Portal Gateway Warga: Halaman publik terpadu (/layanan) yang ramah pengguna.');

drawHeading2('3.3 Pemetaan Layer Controller, Service, & Repository');
drawTable(
    ['Modul Sistem', 'Controller Class', 'Service Class', 'Repository Class'],
    [
        ['Persuratan', 'AdminLetterController / PublicLetterController', 'LetterApprovalService / LetterRequestService', 'LetterRepository / LetterHistoryRepository'],
        ['Pengaduan AI', 'ComplaintController / PublicComplaintController', 'ComplaintService / ComplaintAssignmentService / N8nService', 'ComplaintRepository / ComplaintHistoryRepository'],
        ['Keuangan', 'ContributionController / FinancialTransactionController', 'ContributionService / LedgerService', 'Polymorphic Query in LedgerService'],
        ['Kependudukan', 'WargaController / KartuKeluargaController', 'WargaService / KartuKeluargaService', 'WargaRepository / KartuKeluargaRepository']
    ],
    [80, 145, 145, 145.28]
);

drawHeading2('3.4 Middleware Stack & Aliases');
drawBullet('auth (Authenticate)', 'Memastikan pengguna telah login sebelum mengakses rute terproteksi.');
drawBullet('guest (RedirectIfAuthenticated)', 'Mencegah pengguna yang sudah login mengakses halaman login/register.');
drawBullet('can (Authorize)', 'Memeriksa izin/ability pengguna menggunakan Policy/Gate (misal: can:manage_system).');
drawBullet('verified (EnsureEmailIsVerified)', 'Memastikan alamat email pengguna telah terverifikasi.');

drawHeading2('3.5 Form Request Validation & Authorization Rules');
drawParagraph('Validasi input terisolasi pada kelas Form Request (app/Http/Requests/):');

drawBullet('StoreWargaRequest', 'Validasi NIK 16 digit unique, no_kk exists, jenis_kelamin in:L,P, tanggal_lahir date.');
drawBullet('StoreKartuKeluargaRequest', 'Validasi no_kk 16 digit unique, rt_code max:5, alamat_lengkap required.');
drawBullet('StoreComplaintRequest', 'Validasi NIK warga, teks_keluhan min:10 karakter, attachments file max 5MB (jpg,png,pdf).');
drawBullet('SubmitContributionRequest', 'Validasi no_kk, iuran_type_id, nominal numeric, periode_bulan 1-12.');
drawBullet('StoreTransactionRequest', 'Validasi transaction_type (INCOME/EXPENSE), category enum, amount, transaction_date.');

drawHeading2('3.6 Autentikasi & Otorisasi RBAC Matrix');
drawParagraph('Pengurus login menggunakan cookie-session Breeze. API menggunakan Laravel Sanctum. Akses kontrol diatur via RoleEnum (SUPER_ADMIN, RW_ADMIN, RT_ADMIN, WARGA, AUDITOR) dan PermissionEnum yang diperiksa melalui Gate::before hook pada AuthServiceProvider.');

drawHeading2('3.7 Event, Listener, Queue & Integrasi AI (N8nService)');
drawParagraph('Event internal (ComplaintSubmitted, LetterSubmitted, ComplaintStatusUpdated, LetterStatusUpdated) didengar oleh Listener (RecordComplaintActivity, RecordLetterAudit, CreateInternalNotification). Integrasi AI dipicu secara asinkron via N8nService HTTP REST client.');

drawHeading2('3.8 Panduan Menjalankan Proyek (How to Run)');
drawParagraph('1. Clone repo & masuk direktori: cd "versi 2"\n2. Install dependensi PHP: composer install\n3. Install dependensi JS: npm install\n4. Salin environment: cp .env.example .env (sesuaikan DB_DATABASE)\n5. Generate Key: php artisan key:generate\n6. Jalankan Migrasi & Seeder: php artisan migrate --seed\n7. Symlink Storage: php artisan storage:link\n8. Menjalankan Server: php artisan serve (terminal 1) & npm run dev (terminal 2)');

drawHeading2('3.9 Panduan Menambah Fitur Baru (Step-by-Step Developer Guide)');
drawParagraph('1. Buat Migration & Model: php artisan make:model Feature -m\n2. Buat Enum / DTO jika diperlukan pada app/Enums/\n3. Buat Repository pada app/Repositories/FeatureRepository.php\n4. Buat Service pada app/Services/FeatureService.php dengan DB::transaction\n5. Buat Form Request pada app/Http/Requests/StoreFeatureRequest.php\n6. Buat Policy pada app/Policies/FeaturePolicy.php & daftarkan di AuthServiceProvider\n7. Buat Controller pada app/Http/Controllers/FeatureController.php dengan Dependency Injection\n8. Daftarkan Rute di routes/web.php & Buat Blade View di resources/views/');


// ==========================================
// PAGE NUMBERING & FOOTER IN BUFFER
// ==========================================
const range = doc.bufferedPageRange(); // { start: 0, count: N }

for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Skip header/footer on cover page (page 0)
    if (i > 0) {
        // Header line & text
        doc.strokeColor(COLORS.border).lineWidth(0.5)
           .moveTo(margin, 25)
           .lineTo(pageWidth - margin, 25)
           .stroke();
           
        doc.fillColor(COLORS.textMuted)
           .font('Helvetica-Bold')
           .fontSize(7.5)
           .text('DOKUMENTASI LENGKAP APLIKASI SIM RW 047', margin, 15, { width: contentWidth, align: 'left' });
           
        doc.fillColor(COLORS.accent)
           .font('Helvetica')
           .fontSize(7.5)
           .text('Bahan Persiapan Sidang Skripsi', margin, 15, { width: contentWidth, align: 'right' });
           
        // Footer line & text
        doc.strokeColor(COLORS.border).lineWidth(0.5)
           .moveTo(margin, pageHeight - 30)
           .lineTo(pageWidth - margin, pageHeight - 30)
           .stroke();
           
        doc.fillColor(COLORS.textMuted)
           .font('Helvetica')
           .fontSize(7.5)
           .text('Sistem Informasi Manajemen RW 047 — Living Documentation & System Reference', margin, pageHeight - 22, { width: contentWidth - 100, align: 'left' });
           
        doc.fillColor(COLORS.secondary)
           .font('Helvetica-Bold')
           .fontSize(7.5)
           .text(`Halaman ${i + 1} dari ${range.count}`, pageWidth - margin - 90, pageHeight - 22, { width: 90, align: 'right' });
    }
}

doc.end();

stream.on('finish', () => {
    console.log("PDF generation complete: " + outputPath);
});
