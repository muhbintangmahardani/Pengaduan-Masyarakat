# Product Requirements Document (PRD)

## Web App Pengaduan Masyarakat & Layanan Publik Skala Enterprise (Gaya JAKI)

## 1. Kontrol Dokumen & Metadata

* **Nama Proyek:** Layanan Aspirasi dan Pengaduan Warga (LAPOR-Warga / JAKI-Web)
* **Versi Dokumen:** 3.0.0 (Enterprise Best-Practice Edition)
* **Status:** Siap untuk Pengembangan (*Ready for Development*)
* **Tech Stack Target:** Next.js (App Router, TypeScript Strict Mode), Tailwind CSS, Shadcn UI, Supabase (PostgreSQL, Auth, Storage, Realtime)

## 2. Ringkasan Eksekutif & Visi Produk

### 2.1 Pernyataan Masalah
Kota-kota dan komunitas lokal sering kali mengalami kendala komunikasi yang terfragmentasi ketika warga ingin melaporkan masalah fasilitas umum (seperti jalan berlubang, lampu jalan rusak, pembuangan liar, atau saluran air tersumbat). Metode konvensional kurang memiliki transparansi pelacakan, akuntabilitas, dan analisis analitik untuk pemerintahan yang efektif.

### 2.2 Visi Produk
Membangun web aplikasi pengaduan masyarakat yang responsif, aman, *scalable*, dan dapat diandalkan (*reliable*), terinspirasi dari aplikasi JAKI Jakarta. Platform ini memberdayakan warga untuk melaporkan gangguan fasilitas umum secara akurat melalui *geotagging* GPS serta bukti foto terkompresi, sekaligus membekali petugas lapangan dan admin dengan *dashboard* pemantauan berbasis prinsip arsitektur perangkat lunak modern (DRY, SOLID).

### 2.3 Nilai Utama & Standar Kualitas (Pilar Arsitektur)
* **Scalable:** Didukung oleh indeks basis data PostgreSQL, pemisahan mutasi data via *Server Actions*, dan optimasi kueri untuk menghadapi lonjakan data.
* **Maintainable:** Struktur folder modular, pemisahan logika bisnis melalui *Custom Hooks*, serta penerapan tipe data TypeScript yang ketat.
* **Reliable:** Penanganan *error* yang tangguh (*try-catch*), pencegahan *double-submit* (idempotency), dan perlindungan RLS Supabase.
* **Reusable:** Komponen UI berbasis Shadcn UI yang atomik dan dapat digunakan ulang di berbagai halaman.

## 3. Persona Pengguna & Matriks Hak Akses (RBAC)

### 3.1 Persona Pengguna
1. **Warga (*Citizen*):** Pengguna umum yang melaporkan masalah fasilitas umum, melacak status riwayat pribadi, dan memantau transparansi publik.
2. **Petugas Lapangan (*Officer*):** Staf operasional yang memverifikasi, menindaklanjuti, dan memperbarui status laporan di lapangan.
3. **Administrator (*Admin*):** Pengelola sistem yang memiliki hak akses penuh, moderasi konten, dan fitur ekspor data.

### 3.2 Matriks Kontrol Akses (RBAC)
| Modul / Fitur | Warga | Petugas Lapangan | Administrator |
| :--- | :---: | :---: | :---: |
| Registrasi & Login | Ya | Dibuatkan Admin | Ya (Super Admin) |
| Beranda & Statistik Publik | Ya | Ya | Ya |
| Formulir Pengaduan (GPS & Upload) | Ya | Tidak | Tidak |
| Pelacakan & Riwayat Pribadi | Ya | Tidak | Tampilan Penuh |
| Perbarui Status & Catatan Lapangan | Tidak | Sesuai Penugasan | Ya (Semua) |
| Dashboard Petugas / Admin | Tidak | Ya | Ya |
| Ekspor Data CSV | Tidak | Tidak | Ya |

## 4. Persyaratan Fungsional Detail

### 4.1 Autentikasi & Keamanan Sesi (`F-AUTH`)
* **F-AUTH-01:** Autentikasi berbasis Supabase Auth (Email & Password). Trigger basis data otomatis menyalin pengguna baru ke tabel `profiles` dengan peran default `citizen`.
* **F-AUTH-02:** Next.js Middleware mencegat akses rute berdasarkan peran (`/dashboard/warga`, `/dashboard/petugas`, `/dashboard/admin`).
* **F-AUTH-03:** Manajemen sesi aman menggunakan `@supabase/ssr` di lingkungan *Edge Runtime*.

### 4.2 Beranda & Ringkasan Statistik (`F-HOME`)
* **F-HOME-01:** Halaman depan publik dengan informasi layanan dan navigasi cepat.
* **F-HOME-02:** Widget statistik *real-time* (Total Pengaduan, Diproses, Selesai) menggunakan komponen *Card* Shadcn UI.

### 4.3 Formulir Pengaduan Masyarakat (`F-COMPLAINT`)
* **F-COMPLAINT-01:** Validasi input ketat menggunakan skema Zod dan React Hook Form (Judul, Kategori, Deskripsi, Alamat).
* **F-COMPLAINT-02:** Integrasi GPS Browser (`navigator.geolocation.getCurrentPosition()`) untuk mengambil koordinat lintang dan bujur secara presisi.
* **F-COMPLAINT-03:** Kompresi gambar otomatis di peramban pengguna (*client-side compression*) agar ukuran file di bawah 2 MB sebelum diunggah ke Supabase Storage.
* **F-COMPLAINT-04:** Generator nomor tiket unik di sisi server dengan format `TKT-YYYYMMDD-XXXX`.
* **F-COMPLAINT-05:** Mekanisme anti-spam / pencegahan klik ganda (*double-submit*).

### 4.4 Pelacakan Status & Riwayat (`F-TRACK`)
* **F-TRACK-01:** Daftar pengaduan pribadi dilengkapi *Badge* status dinamis (`Pending`, `Verified`, `In Progress`, `Resolved`, `Rejected`).
* **F-TRACK-02:** Linimasa riwayat yang menampilkan catatan tindak lanjut dari petugas lapangan.

### 4.5 Dashboard Petugas & Admin (`F-ADMIN`)
* **F-ADMIN-01:** Tabel data interaktif dengan fitur filter kategori dan status.
* **F-ADMIN-02:** Dialog aksi cepat bagi petugas untuk memperbarui status dan melampirkan catatan investigasi.
* **F-ADMIN-03:** Fitur ekspor data terfilter ke format `.csv` yang aman untuk kebutuhan administratif.

## 5. Arsitektur Non-Fungsional & Keamanan Database

### 5.1 Skema Basis Data & Indexing (Supabase PostgreSQL)
Untuk memastikan skalabilitas saat volume data besar, tabel utama dilengkapi dengan indeks pada kolom pencarian:
- Tabel `profiles`: Menyimpan profil pengguna dan peran (`citizen`, `officer`, `admin`).
- Tabel `complaints`: Menyimpan detail pengaduan, koordinat GPS, URL foto, dan status.
- Tabel `audit_logs`: Mencatat aktivitas penting sistem untuk audit keamanan.
- **Database Indexing:** Indeks pada kolom `status`, `user_id`, `created_at`, dan `ticket_number`.

### 5.2 Row Level Security (RLS) Policies
* **Tabel `profiles`:** Pengguna dapat membaca dan memperbarui profil mereka sendiri.
* **Tabel `complaints`:** 
  * Warga hanya dapat menyisipkan dan membaca pengaduan milik mereka sendiri.
  * Petugas dan Admin dapat membaca seluruh pengaduan serta memperbarui status laporan.
  * Publik dapat melihat data *feed* dengan sensor informasi privat.

## 6. Struktur Folder Proyek yang Direkomendasikan
```text
src/
├── app/                  # Next.js App Router (Halaman & Route Handlers)
├── components/           # Komponen UI Reusable (Shadcn UI & Custom Components)
├── hooks/                # Custom Hooks (misal: useGeolocation, useFileUpload)
├── lib/                  # Konfigurasi klien Supabase & utilitas
├── types/                # Definisi TypeScript terpusat (database, profile, complaint)
└── schemas/              # Skema validasi Zod terpusat
```

## 7. Metrik Keberhasilan & Kriteria Penerimaan
* Pengambilan koordinat GPS sukses dalam radius toleransi standar perangkat.
* Kompresi foto sisi klien berhasil menurunkan ukuran file gambar besar menjadi < 2 MB tanpa kegagalan unggah.
* Waktu respons kueri basis data tetap cepat di bawah 200ms berkat penerapan indeks PostgreSQL.