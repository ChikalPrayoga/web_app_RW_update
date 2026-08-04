<<<<<<< HEAD
<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

# 🚀 Panduan Jalankan Proyek (Setup di Perangkat Baru)

Ikuti langkah-langkah berikut jika ingin menjalankan proyek ini di laptop/perangkat lain:

## 1. Clone Repository
###bash
git clone https://github.com/ChikalPrayoga/web_app_RW_update.git
cd web_app_RW_update

## 2. Install Dependensi (PHP & Node.js)
###bash
composer install
npm install

## 3. Konfigurasi Database
Buat file .env dari .env.example:
###bash
cp .env.example .env

Edit .env sesuai kredensial database Anda (MySQL/MariaDB):
DB_CONNECTION=mysql
DB_HOST=[IP_ADDRESS]
DB_PORT=3306
DB_DATABASE=nama_database_anda
DB_USERNAME=root
DB_PASSWORD=[PASSWORD]

Atau
Salin file .env.example menjadi .env:

Di Windows (PowerShell): copy .env.example .env
Di Bash/Linux/Mac: cp .env.example .env
Lalu buat kunci aplikasi (App Key):

###bash
php artisan key:generate

## 4. Migrasi Database
Buka file .env yang baru dibuat, lalu sesuaikan nama database, username, dan password MySQL/SQLite Anda. Setelah itu jalankan migrasi:

###bash
php artisan migrate

## 5. Jalankan Aplikasi
Jalankan server Laravel dan kompiler asset frontend di dua terminal terpisah:

Terminal 1 (Laravel Server):
###bash
php artisan serve
Terminal 2 (Frontend Vite/Mix):
###bash
npm run dev