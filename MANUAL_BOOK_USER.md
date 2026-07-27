# 📘 MANUAL BOOK USER
## Sistem Informasi SMAN 1 Pamekasan

**Versi Dokumen:** 1.0  
**Tanggal:** Juli 2025  
**Aplikasi:** Sistem Informasi Akademik & Landing Page SMAN 1 Pamekasan

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Landing Pages (Website Publik)](#2-landing-pages-website-publik)
   - 2.1. Halaman Utama (Beranda)
   - 2.2. Halaman Berita (Detail Berita)
   - 2.3. Halaman Prestasi
   - 2.4. Halaman Form Prestasi
   - 2.5. Halaman Tracking Alumni
   - 2.6. Halaman Testimoni Alumni
   - 2.7. Halaman Direktori Guru
   - 2.8. Halaman Dinamis (Dynamic Page)
3. [Dashboard Admin (Sistem Informasi)](#3-dashboard-admin-sistem-informasi)
   - 3.1. Dashboard Utama
   - 3.2. Data Pendaftar
   - 3.3. Data Siswa
   - 3.4. Data Kelas
   - 3.5. Pembagian Kelas (Set Kelas)
   - 3.6. Tahun Ajaran
   - 3.7. Laporan & Statistik
   - 3.8. Profile Akun
   - 3.9. Alumni
   - 3.10. Penelusuran Alumni (Tracking)
   - 3.11. Manajemen Berita (CMS)
   - 3.12. Manajemen Prestasi (CMS)
   - 3.13. Manajemen Fasilitas (CMS)
   - 3.14. Manajemen Ekstrakurikuler (CMS)
   - 3.15. Manajemen Agenda (CMS)
   - 3.16. Manajemen Pengumuman (CMS)
   - 3.17. Manajemen Halaman Tambahan (CMS)
   - 3.18. Manajemen Menu Navigasi (CMS)
   - 3.19. Manajemen Data Guru (CMS)
   - 3.20. Manajemen Keunggulan Sekolah (CMS)
   - 3.21. Manajemen Program Jurusan (CMS)
   - 3.22. Manajemen Kata-kata Guru (Quotes)
   - 3.23. Manajemen Testimoni
   - 3.24. Pengaturan Landing Page (Settings)
   - 3.25. Pengaturan NIS
   - 3.26. Pengaturan Penelusuran (Tracking)
   - 3.27. Manajemen Pengguna & Akses
4. [Cara Penggunaan Umum](#4-cara-penggunaan-umum)
   - 4.1. Login ke Dashboard
   - 4.2. Navigasi Sidebar
   - 4.3. Fitur Pencarian & Filter
   - 4.4. Aksi Massal (Bulk Actions)
   - 4.5. Import Data dengan AI
   - 4.6. Notifikasi

---

## 1. PENDAHULUAN

**Sistem Informasi SMAN 1 Pamekasan** adalah aplikasi berbasis web yang terdiri dari dua bagian utama:

1. **Landing Pages (Website Publik)** — Halaman website publik yang dapat diakses oleh siapa saja (masyarakat umum, calon siswa, orang tua, alumni).
2. **Dashboard Admin (Sistem Informasi Akademik)** — Halaman admin yang dilindungi dengan autentikasi, digunakan untuk mengelola data akademik sekolah dan konten website.

### Teknologi yang Digunakan
- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Lumen (PHP Micro Framework)
- **Library:** Framer Motion, Recharts, Axios, XLSX, React Quill, Jodit Editor, TinyMCE

---

## 2. LANDING PAGES (WEBSITE PUBLIK)

Website publik SMAN 1 Pamekasan dapat diakses melalui URL yang telah ditentukan (biasanya `http://localhost:5174` atau domain sekolah). Halaman ini menampilkan informasi profil sekolah untuk masyarakat umum.

### 2.1. Halaman Utama (Beranda)

**URL:** `/`

Halaman beranda adalah halaman pertama yang dilihat pengunjung. Terdiri dari beberapa section:

#### a. **Navbar (Navigasi Atas)**
- **Fungsi:** Menu navigasi utama website.
- **Isi:** Menu-menu seperti Beranda, Profil, Program, Berita, Fasilitas, Prestasi, Guru, Testimoni, Agenda, PPDB.
- **Cara pakai:** Klik menu untuk scroll ke section terkait atau membuka halaman lain.

#### b. **Hero Section**
- **Fungsi:** Banner utama dengan teks selamat datang dan slogan sekolah.
- **Cara pakai:** Pengunjung melihat informasi utama. Tombol "Daftar Sekarang" mengarah ke link PPDB. Tombol "Jelajahi" scroll ke section program.

#### c. **Announcement Marquee (Pengumuman Berjalan)**
- **Fungsi:** Menampilkan pengumuman/pesan penting dalam bentuk teks berjalan.
- **Cara pakai:** Pengumuman akan bergerak otomatis dari kanan ke kiri.

#### d. **Statistik Sekolah**
- **Fungsi:** Menampilkan angka statistik (total kelas, siswa aktif, alumni).
- **Cara pakai:** Angka ditampilkan dengan animasi hitung otomatis.

#### e. **Sambutan Kepala Sekolah**
- **Fungsi:** Menampilkan foto dan sambutan dari Kepala Sekolah.
- **Cara pakai:** Pengunjung membaca sambutan. Data diambil dari pengaturan landing page di dashboard admin.

#### f. **Keunggulan Sekolah (Why Choose Us)**
- **Fungsi:** Menampilkan keunggulan-keunggulan SMAN 1 Pamekasan.
- **Cara pakai:** Card-grid dengan ikon, judul, dan deskripsi. Data dikelola dari menu "Keunggulan Sekolah" di dashboard admin.

#### g. **Program Peminatan (Jurusan)**
- **Fungsi:** Menampilkan program jurusan yang tersedia (MIPA, IPS, Bahasa).
- **Cara pakai:** Klik tab untuk melihat detail masing-masing jurusan. Data dikelola dari menu "Program Jurusan" di dashboard admin.

#### h. **Berita & Informasi Terkini**
- **Fungsi:** Menampilkan berita-berita terbaru dari sekolah.
- **Cara pakai:** 
  - Filter berita berdasarkan kategori di sidebar kiri.
  - Klik card berita untuk membaca detail.
  - Navigasi halaman (pagination) tersedia di bagian bawah.
  - Data dikelola dari menu "Berita Sekolah" di dashboard admin.

#### i. **Fasilitas Sekolah**
- **Fungsi:** Menampilkan daftar fasilitas sekolah.
- **Cara pakai:** Card-grid dengan gambar dan deskripsi. Data dikelola dari menu "Fasilitas Sekolah" di dashboard admin.

#### j. **Prestasi Siswa**
- **Fungsi:** Menampilkan prestasi yang diraih siswa.
- **Cara pakai:** Card interaktif dengan efek hover yang menampilkan detail siswa. Klik "Lihat Semua Prestasi" untuk halaman khusus. Data dikelola dari menu "Prestasi Siswa" di dashboard admin.

#### k. **Ekstrakurikuler**
- **Fungsi:** Menampilkan daftar kegiatan ekstrakurikuler.
- **Cara pakai:** Ditampilkan dalam grid. Data dikelola dari menu "Ekstrakurikuler" di dashboard admin.

#### l. **Tenaga Pendidik (Guru)**
- **Fungsi:** Menampilkan profil para guru.
- **Cara pakai:** Card dengan foto, nama, dan mata pelajaran. Klik "Lihat Semua" untuk halaman Direktori Guru. Data dikelola dari menu "Data Guru" di dashboard admin.

#### m. **Kata-kata Guru (Quotes)**
- **Fungsi:** Menampilkan kutipan inspiratif dari guru.
- **Cara pakai:** Ditampilkan di section khusus dengan background putih. Data dikelola dari menu "Kata-kata Guru" di dashboard admin.

#### n. **Testimoni Alumni**
- **Fungsi:** Menampilkan testimoni dari alumni.
- **Cara pakai:** 
  - Tombol "Beri Testimoni Anda" untuk mengisi testimoni baru (halaman form).
  - Testimoni ditampilkan dalam slider/carousel.
  - Data dikelola dari menu "Testimoni" di dashboard admin.

#### o. **Agenda Sekolah**
- **Fungsi:** Menampilkan jadwal kegiatan sekolah.
- **Cara pakai:** List agenda dengan tanggal, judul, dan deskripsi. Data dikelola dari menu "Agenda Sekolah" di dashboard admin.

#### p. **Footer**
- **Fungsi:** Informasi kontak, menu, media sosial, dan statistik pengunjung.
- **Isi:** 
  - Kolom 1: Logo, deskripsi, kontak (email, telepon, alamat).
  - Kolom 2: Menu utama & Aplikasi Siswa (link ke dashboard admin & tracking alumni).
  - Kolom 3: Kategori berita.
  - Kolom 4: Statistik pengunjung (hari ini, bulan ini, tahun ini).
  - Copyright bar dengan link media sosial.

---

### 2.2. Halaman Detail Berita

**URL:** `/berita/:id`

- **Fungsi:** Menampilkan detail lengkap dari sebuah berita.
- **Cara pakai:** 
  - Dibuka dari klik card berita di halaman utama.
  - Menampilkan judul, gambar, tanggal, kategori, dan isi berita lengkap.

---

### 2.3. Halaman Prestasi

**URL:** `/prestasi`

- **Fungsi:** Menampilkan seluruh daftar prestasi siswa dalam bentuk grid.
- **Cara pakai:** 
  - Lihat semua prestasi yang telah dicatat.
  - Klik salah satu prestasi untuk melihat detail.
  - Terdapat filter dan pencarian.

---

### 2.4. Halaman Form Prestasi

**URL:** `/prestasi/form`

- **Fungsi:** Formulir untuk mengajukan/mencatat prestasi baru oleh siswa atau admin.
- **Cara pakai:** 
  - Isi data prestasi (nama siswa, kejuaraan, tingkat, tahun, deskripsi, dll).
  - Upload foto/sertifikat pendukung.
  - Kirim data untuk direview admin.

---

### 2.5. Halaman Tracking Alumni

**URL:** `/tracking-alumni`

- **Fungsi:** Halaman publik untuk alumni mengisi data penelusuran (tracking) setelah lulus.
- **Cara pakai:**
  - Alumni memasukkan NIS/NISN untuk verifikasi.
  - Mengisi data: pilihan setelah lulus (kuliah/kerja/bisnis/belum).
  - Jika kuliah: nama universitas, jurusan, jalur seleksi.
  - Jika kerja: nama perusahaan, posisi, estimasi gaji.
  - Jika bisnis: bidang usaha, nama bisnis, modal awal.
  - Data akan masuk ke dashboard admin untuk direview.

---

### 2.6. Halaman Testimoni Alumni

**URL:** `/testimoni-alumni`

- **Fungsi:** Formulir untuk alumni memberikan testimoni.
- **Cara pakai:**
  - Isi nama, tahun lulus, dan pesan testimoni.
  - Kirim untuk ditampilkan di halaman utama setelah disetujui admin.

---

### 2.7. Halaman Direktori Guru

**URL:** `/direktori-guru`

- **Fungsi:** Menampilkan seluruh data guru dalam format grid/direktori.
- **Cara pakai:** 
  - Lihat daftar lengkap guru beserta foto, nama, jabatan, dan mata pelajaran.
  - Data dikelola dari menu "Data Guru" di dashboard admin.

---

### 2.8. Halaman Dinamis (Dynamic Page)

**URL:** `/page/:slug`

- **Fungsi:** Menampilkan halaman tambahan yang dibuat melalui CMS.
- **Cara pakai:** 
  - Halaman ini dibuat dan dikelola dari menu "Halaman Tambahan" di dashboard admin.
  - Berguna untuk halaman profil, visi-misi, kebijakan, dll.

---

## 3. DASHBOARD ADMIN (SISTEM INFORMASI)

Dashboard admin dapat diakses melalui URL frontend (`http://localhost:5173` atau domain terkait). Pengguna harus login terlebih dahulu.

### 3.1. Dashboard Utama

**URL:** `/dashboard`  
**Akses:** Semua pengguna yang login

**Fungsi:**
- Menampilkan ringkasan data sekolah secara real-time.
- Menjadi halaman pertama setelah login.

**Tampilan:**
- **Welcome Banner:** Pesan selamat datang.
- **Kartu Statistik:**
  - **Total Siswa**: Jumlah seluruh siswa terdaftar.
  - **Total Pendaftar**: Jumlah calon siswa baru.
  - **Tahun Ajaran**: Tahun ajaran yang sedang aktif.
  - **Total Admin**: Jumlah admin sistem.
- **Aktivitas Terkini**: Tabel aktivitas terbaru di sistem (aksi yang dilakukan pengguna).
- **Tindakan Cepat**: Tombol shortcut ke fungsi-fungsi umum.

**Cara Pakai:**
1. Setelah login, dashboard akan muncul secara otomatis.
2. Lihat ringkasan data di kartu statistik.
3. Scroll ke bawah untuk melihat aktivitas terkini.
4. Gunakan tombol "Tindakan Cepat" untuk akses langsung ke halaman tertentu.

---

### 3.2. Data Pendaftar

**URL:** `/pendaftar`  
**Akses:** Pengguna dengan permission `pendaftaran.view`

**Fungsi:**
- Mengelola data calon siswa baru (PPDB).
- Menambah, mengedit, menghapus, dan melihat detail pendaftar.
- Import data pendaftar menggunakan file Excel dengan bantuan AI.
- Mengubah status pendaftar (diterima/ditolak/pending).

**Tampilan:**
- **Header:** Judul halaman dan tombol "Tambah Pendaftaran".
- **Tabel Data:** Daftar pendaftar dengan kolom: No. Pendaftaran, NISN, Nama, JK, Asal Sekolah, Kecamatan, Jalur, Tanggal Daftar, Status, Aksi.
- **Filter:** Berdasarkan status, jalur, dan pencarian teks.
- **Pagination:** Pengaturan jumlah data per halaman.

**Cara Pakai:**

#### Menambah Pendaftar Baru
1. Klik tombol **"Tambah Pendaftaran"** di pojok kanan atas.
2. Pilih metode:
   - **Input Manual**: Isi form satu per satu.
   - **Import + AI**: Upload file Excel, AI akan otomatis memetakan kolom.
3. Jika memilih **Input Manual**:
   - Isi form data diri, data orang tua/wali, dan data pendaftaran.
   - Klik "Simpan".
4. Jika memilih **Import + AI**:
   - Upload file Excel/CSV.
   - AI akan menganalisis dan memetakan kolom otomatis.
   - Koreksi mapping jika diperlukan.
   - Klik "Import" untuk menjalankan.

#### Melihat Detail Pendaftar
- Klik ikon 👁️ (Lihat) pada baris pendaftar.
- Akan muncul modal dengan informasi lengkap.

#### Mengedit Pendaftar
- Klik ikon ✏️ (Edit) pada baris pendaftar.
- Ubah data yang diperlukan di form.
- Klik "Simpan".

#### Menghapus Pendaftar
- Klik ikon 🗑️ (Hapus) pada baris pendaftar.
- Konfirmasi penghapusan.

#### Aksi Massal
1. Centang kotak pada baris yang dipilih.
2. Pilih aksi:
   - **Edit Massal**: Ubah field tertentu (status/jalur) untuk banyak pendaftar sekaligus.
   - **Hapus Massal**: Hapus banyak pendaftar sekaligus.

#### Migrasi Pendaftar ke Siswa
- Pendaftar dengan status "Diterima" dapat dimigrasi menjadi data siswa (dari halaman Data Siswa).

---

### 3.3. Data Siswa

**URL:** `/siswa`  
**Akses:** Pengguna dengan permission `siswa.view`

**Fungsi:**
- Mengelola data siswa aktif dan alumni.
- Menambah, mengedit, menghapus, dan melihat detail siswa.
- Migrasi pendaftar yang diterima menjadi siswa.
- Import data siswa dengan AI.

**Tampilan:**
- **Header:** Judul halaman dan tombol "Tambah Siswa".
- **Kartu Statistik:** Total siswa, siswa aktif, alumni.
- **Tabel Data:** NIS, Kelas, Nama, JK, NISN, Tahun Masuk, Tahun Lulus, Tahun Ajaran, Status, Aksi.
- **Filter:** Tahun masuk, tahun ajaran, pencarian teks.
- **Pagination.**

**Cara Pakai:**

#### Menambah Siswa Baru
1. Klik **"Tambah Siswa"** → pilih metode.
2. **Input Manual:**
   - Isi data diri siswa (NIS, Nama, Jenis Kelamin, NISN, Tempat/Tanggal Lahir, Agama, Alamat, dll).
   - Isi data akademik (Tahun Masuk, Tahun Ajaran, Kelas 10/11/12).
   - Tentukan status Aktif/Alumni.
   - Klik "Simpan".
3. **Import + AI:**
   - Pilih jenis import: "Siswa Baru/Aktif" atau "Siswa Lama/Alumni".
   - Jika "Siswa Lama", pilih Tahun Ajaran yang sesuai.
   - Upload file Excel/CSV.
   - Koreksi mapping AI → Import.

#### Migrasi dari Pendaftar
- Dari halaman Pendaftar, pastikan status "Diterima".
- Buka halaman Siswa, cari data yang sudah termigrasi otomatis atau lakukan migrasi manual.

#### Edit & Hapus Siswa
- Sama seperti pendaftar: gunakan ikon aksi di tabel.
- Aksi massal juga tersedia (edit status aktif/non-aktif).

---

### 3.4. Data Kelas

**URL:** `/kelas`  
**Akses:** Pengguna dengan permission `kelas.view`

**Fungsi:**
- Mengelola daftar kelas (rombel) di sekolah.
- Menambah, mengedit, menghapus kelas.

**Tampilan:**
- **Tabel Data:** Nama Kelas, Tingkat, Jurusan, Rombel, Status Aktif, Aksi.

**Cara Pakai:**
1. Klik **"Tambah Kelas"** untuk menambah kelas baru.
2. Isi form:
   - **Nama Kelas:** Contoh: X-MIPA-1
   - **Tingkat:** X, XI, atau XII.
   - **Jurusan:** IPA, IPS, MIPA, IIS, Bahasa, Agama (opsional).
   - **Rombel:** Nomor rombongan belajar.
   - **Status Aktif:** Centang jika kelas masih aktif.
3. Klik "Simpan".
4. Edit/hapus menggunakan ikon aksi.

---

### 3.5. Pembagian Kelas (Set Kelas)

**URL:** `/set-kelas`  
**Akses:** Pengguna dengan permission `set_kelas.view`

**Fungsi:**
- Memindahkan siswa antar kelas.
- Menetapkan wali kelas/guru ke kelas tertentu.
- Memudahkan pembagian kelas baru setiap tahun ajaran.

**Tampilan:**
- **Tab Siswa:** Untuk memindahkan siswa antar kelas.
- **Tab Guru:** Untuk menetapkan guru wali kelas.
- Dua panel: daftar siswa/guru dari kelas asal dan kelas tujuan.

**Cara Pakai:**

#### Memindahkan Siswa
1. Pilih tab **"Siswa"**.
2. Pilih **Kelas Asal** dari dropdown.
3. Centang siswa yang akan dipindahkan.
4. Pilih **Kelas Tujuan**.
5. Klik "Simpan Perubahan".

#### Menetapkan Guru ke Kelas
1. Pilih tab **"Guru"**.
2. Pilih kelas dari dropdown.
3. Centang guru yang akan menjadi wali kelas.
4. Klik "Simpan".

---

### 3.6. Tahun Ajaran

**URL:** `/tahun-ajaran`  
**Akses:** Pengguna dengan permission `tahun_ajaran.view`

**Fungsi:**
- Mengelola data tahun ajaran.
- Menentukan tahun ajaran yang sedang aktif.

**Tampilan:**
- **Tabel Data:** Tahun ajaran, status aktif, Aksi.

**Cara Pakai:**
1. Klik **"Tambah Tahun Ajaran"**.
2. Masukkan tahun (contoh: 2025/2026).
3. Centang "Aktifkan" jika ini tahun ajaran yang sedang berjalan.
4. Klik "Simpan".
5. Hanya satu tahun ajaran yang bisa aktif dalam satu waktu.
6. Edit/hapus menggunakan ikon aksi.

---

### 3.7. Laporan & Statistik

**URL:** `/laporan`  
**Akses:** Pengguna dengan permission `laporan.view`

**Fungsi:**
- Menampilkan laporan dan grafik statistik pendaftaran dan data siswa.
- Export data ke Excel.

**Tampilan:**
- **Grafik Pendaftaran:** Bar chart stacked (diterima, ditolak, pending) per periode.
- **Grafik Siswa:** Pie chart atau bar chart untuk komposisi siswa per kelas/jurusan.
- **Tabel Data:** Ringkasan data pendaftaran dan siswa.

**Cara Pakai:**
1. Pilih periode/tahun ajaran yang ingin dilihat (jika ada filter).
2. Lihat grafik dan data yang ditampilkan.
3. Klik tombol **"Export Excel"** untuk mendownload data laporan dalam format Excel.

---

### 3.8. Profile Akun

**URL:** `/profile`  
**Akses:** Semua pengguna yang login

**Fungsi:**
- Mengubah data profil pengguna (nama, email, foto).
- Mengubah password akun.

**Cara Pakai:**

#### Mengupdate Profil
1. Ubah **Nama** dan **Email** jika diperlukan.
2. Klik area foto atau tombol "Ganti Foto" untuk upload foto profil baru.
3. Klik **"Simpan Profil"**.

#### Mengganti Password
1. Masukkan **Password Saat Ini**.
2. Masukkan **Password Baru** dan **Konfirmasi Password Baru**.
3. Klik **"Simpan Password"**.

---

### 3.9. Alumni

**URL:** `/admin/alumni`  
**Akses:** Pengguna dengan permission `alumni.view`

**Fungsi:**
- Melihat daftar alumni (siswa yang sudah tidak aktif).
- Mengelola data alumni.
- Filter dan pencarian data alumni.

**Tampilan:**
- **Tabel Data:** Nama, NIS, Tahun Lulus, Kategori Tracking (kuliah/kerja/bisnis), Aksi.
- **Filter:** Tahun lulus, kategori tracking, pencarian teks.

**Cara Pakai:**
1. Lihat daftar alumni yang terdata.
2. Gunakan filter untuk mempersempit pencarian.
3. Klik baris alumni untuk melihat detail tracking (jika sudah mengisi).
4. Centang untuk aksi massal (hapus massal).

---

### 3.10. Penelusuran Alumni (Tracking)

**URL:** `/admin/alumni-tracking`  
**Akses:** Pengguna dengan permission `alumni_tracking.view`

**Fungsi:**
- Dashboard penelusuran alumni.
- Melihat dan mengedit data tracking alumni (kuliah/kerja/bisnis).
- Memantau status pengisian tracking oleh alumni.

**Tampilan:**
- **Tabel Data:** Nama, NIS, Kategori Pilihan, Detail (universitas/perusahaan/usaha), Status.
- **Filter:** Tahun lulus, kategori, pencarian teks.

**Cara Pakai:**

#### Melihat Detail Tracking
1. Klik ikon 👁️ pada baris alumni.
2. Akan muncul modal detail lengkap tracking.

#### Mengedit Tracking (Admin)
1. Klik ikon ✏️ pada baris alumni.
2. Pilih kategori: **Kuliah**, **Kerja**, **Bisnis**, atau **Belum**.
3. Isi data sesuai kategori:
   - **Kuliah:** Universitas pilihan 1 & 2, Jurusan, Jalur Seleksi, Status Seleksi.
   - **Kerja:** Nama Perusahaan, Posisi, Estimasi Gaji.
   - **Bisnis:** Bidang Usaha, Nama Bisnis, Modal Awal.
4. Klik "Simpan".

#### Aksi Massal
- Hapus massal data tracking yang dipilih.

---

### 3.11. Manajemen Berita (CMS)

**URL:** `/admin/website/news`  
**Akses:** Pengguna dengan permission `berita.view`

**Fungsi:**
- Mengelola berita sekolah yang tampil di landing pages.
- CRUD (Create, Read, Update, Delete) berita.

**Cara Pakai:**
1. Klik **"Tambah Berita"**.
2. Isi:
   - **Judul:** Judul berita.
   - **Kategori:** Pilih kategori (Prestasi, Informasi, Kegiatan, Pengumuman, Artikel).
   - **Konten:** Gunakan editor teks (TinyMCE/Jodit) untuk menulis berita.
   - **Gambar:** Upload gambar thumbnail (opsional).
   - **Tanggal Publikasi:** Atur tanggal tayang.
3. Klik "Simpan" atau "Publikasikan".
4. Edit/hapus menggunakan ikon aksi di tabel.

---

### 3.12. Manajemen Prestasi (CMS)

**URL:** `/admin/website/prestasi`  
**Akses:** Pengguna dengan permission `prestasi.view`

**Fungsi:**
- Mengelola data prestasi siswa yang tampil di landing pages.

**Cara Pakai:**
1. Klik **"Tambah Prestasi"**.
2. Isi:
   - **Judul Prestasi:** Nama kejuaraan/lomba.
   - **Tingkat:** Nasional, Provinsi, Kabupaten, Internasional.
   - **Tahun:** Tahun pencapaian.
   - **Siswa:** Pilih siswa yang meraih prestasi (bisa lebih dari satu).
   - **Deskripsi:** Deskripsi prestasi.
   - **Gambar:** Upload foto/sertifikat (opsional).
3. Klik "Simpan".
4. Prestasi akan tampil di landing pages.

---

### 3.13. Manajemen Fasilitas (CMS)

**URL:** `/admin/website/fasilitas`  
**Akses:** Pengguna dengan permission `fasilitas.view`

**Fungsi:**
- Mengelola data fasilitas sekolah yang tampil di landing pages.

**Cara Pakai:**
1. Klik **"Tambah Fasilitas"**.
2. Isi:
   - **Nama Fasilitas:** Contoh: Laboratorium Komputer.
   - **Deskripsi:** Penjelasan fasilitas.
   - **Gambar:** Upload foto fasilitas.
3. Klik "Simpan".
4. Fasilitas akan tampil di section "Fasilitas Sekolah" di landing pages.

---

### 3.14. Manajemen Ekstrakurikuler (CMS)

**URL:** `/admin/website/ekstrakurikuler`  
**Akses:** Pengguna dengan permission `ekstrakurikuler.view`

**Fungsi:**
- Mengelola data kegiatan ekstrakurikuler.

**Cara Pakai:**
1. Klik **"Tambah Ekstrakurikuler"**.
2. Isi:
   - **Nama Ekstrakurikuler:** Contoh: Pramuka, Paskibra, Futsal.
   - **Deskripsi:** Penjelasan kegiatan.
   - **Pembina:** Nama guru pembina.
   - **Gambar:** Upload foto kegiatan (opsional).
3. Klik "Simpan".

---

### 3.15. Manajemen Agenda (CMS)

**URL:** `/admin/website/agenda`  
**Akses:** Pengguna dengan permission `agenda.view`

**Fungsi:**
- Mengelola agenda/jadwal kegiatan sekolah.

**Cara Pakai:**
1. Klik **"Tambah Agenda"**.
2. Isi:
   - **Judul Agenda:** Nama kegiatan.
   - **Tanggal:** Tanggal pelaksanaan.
   - **Tipe:** Akademik atau Non-Akademik.
   - **Deskripsi:** Keterangan kegiatan (opsional).
3. Klik "Simpan".
4. Agenda akan tampil di landing pages di section "Agenda Sekolah".

---

### 3.16. Manajemen Pengumuman (CMS)

**URL:** `/admin/website/pengumuman`  
**Akses:** Pengguna dengan permission `pengumuman.view`

**Fungsi:**
- Mengelola pengumuman yang tampil di marquee (teks berjalan) landing pages.

**Cara Pakai:**
1. Klik **"Tambah Pengumuman"**.
2. Isi teks pengumuman.
3. Tentukan status aktif/non-aktif.
4. Klik "Simpan".
5. Pengumuman aktif akan muncul sebagai teks berjalan di landing pages.

---

### 3.17. Manajemen Halaman Tambahan (CMS)

**URL:** `/admin/website/pages`  
**Akses:** Pengguna dengan permission `halaman.view`

**Fungsi:**
- Membuat halaman statis tambahan (contoh: Profil Sekolah, Visi Misi, Kebijakan Privasi).

**Cara Pakai:**
1. Klik **"Tambah Halaman"**.
2. Isi:
   - **Judul Halaman:** Contoh: Profil Sekolah.
   - **Slug:** URL unik (contoh: profil-sekolah).
   - **Konten:** Gunakan editor teks.
   - **Status:** Publikasikan atau simpan sebagai draft.
3. Klik "Simpan".
4. Halaman dapat diakses di `/page/:slug` di landing pages.

---

### 3.18. Manajemen Menu Navigasi (CMS)

**URL:** `/admin/website/navbar`  
**Akses:** Pengguna dengan permission `navigasi.view`

**Fungsi:**
- Mengelola menu navigasi yang tampil di navbar landing pages.

**Cara Pakai:**
1. Tambah item menu baru.
2. Isi:
   - **Label:** Teks yang tampil (contoh: Beranda, Profil).
   - **Tipe:** Internal (scroll ke section) atau External (link URL).
   - **URL/Section ID:** Target navigasi.
   - **Urutan:** Posisi menu.
   - **Status:** Aktif/non-aktif.
3. Klik "Simpan".
4. Urutkan menu dengan drag-and-drop jika tersedia.

---

### 3.19. Manajemen Data Guru (CMS)

**URL:** `/admin/website/teachers`  
**Akses:** Pengguna dengan permission `teachers.view`

**Fungsi:**
- Mengelola data guru yang tampil di landing pages dan direktori guru.

**Cara Pakai:**
1. Klik **"Tambah Guru"**.
2. Isi:
   - **Nama:** Nama lengkap guru.
   - **Jabatan:** Kepala Sekolah, Wali Kelas, Guru Mapel, dll.
   - **Mata Pelajaran:** Mapel yang diampu.
   - **Foto:** Upload foto profil guru.
3. Klik "Simpan".
4. Guru akan tampil di section "Tenaga Pendidik" dan halaman "Direktori Guru".

---

### 3.20. Manajemen Keunggulan Sekolah (CMS)

**URL:** `/admin/website/features`  
**Akses:** Pengguna dengan permission `features.view`

**Fungsi:**
- Mengelola keunggulan/poin plus sekolah yang tampil di landing pages.

**Cara Pakai:**
1. Klik **"Tambah Keunggulan"**.
2. Isi:
   - **Judul:** Contoh: Akreditasi A - Unggul.
   - **Deskripsi:** Penjelasan keunggulan.
   - **Icon:** Pilih ikon (Bootstrap Icons).
3. Klik "Simpan".

---

### 3.21. Manajemen Program Jurusan (CMS)

**URL:** `/admin/website/programs`  
**Akses:** Pengguna dengan permission `programs.view`

**Fungsi:**
- Mengelola data program peminatan/jurusan (MIPA, IPS, Bahasa).

**Cara Pakai:**
1. Klik **"Tambah Program"**.
2. Isi:
   - **Nama Jurusan:** Contoh: MIPA, IPS, Bahasa.
   - **Deskripsi:** Penjelasan program.
   - **Fitur:** Daftar keunggulan program (mata pelajaran unggulan, prospek karir).
   - **Gambar:** Upload ilustrasi.
3. Klik "Simpan".

---

### 3.22. Manajemen Kata-kata Guru (Quotes)

**URL:** `/admin/website/quotes`  
**Akses:** Pengguna dengan permission `quotes.view`

**Fungsi:**
- Mengelola kutipan/kata-kata inspiratif dari guru.

**Cara Pakai:**
1. Klik **"Tambah Quotes"**.
2. Isi:
   - **Quote:** Teks kutipan.
   - **Nama Guru:** Pengarang kutipan.
3. Klik "Simpan".
4. Quote akan tampil di landing pages. Bisa lebih dari satu (ditampilkan bergantian).

---

### 3.23. Manajemen Testimoni

**URL:** `/admin/website/testimonials`  
**Akses:** Pengguna dengan permission `testimonials.view`

**Fungsi:**
- Mengelola testimoni dari alumni.
- Menyetujui/menampilkan atau menolak testimoni yang masuk.

**Cara Pakai:**
1. Lihat daftar testimoni yang masuk (dari halaman publik atau admin).
2. **Setujui** testimoni untuk ditampilkan di landing pages.
3. **Tolak/Hapus** testimoni yang tidak sesuai.
4. Testimoni yang disetujui akan muncul di section testimoni landing pages.

---

### 3.24. Pengaturan Landing Page (Settings)

**URL:** `/admin/website/settings`  
**Akses:** Pengguna dengan permission `landing_settings.view`

**Fungsi:**
- Mengatur konten dan tampilan landing pages secara global.

**Pengaturan yang tersedia:**
- **Informasi Sekolah:** Nama sekolah, alamat, email, telepon, link Google Maps.
- **Kepala Sekolah:** Nama, gelar, foto, pesan sambutan.
- **PPDB:** Link pendaftaran PPDB.
- **Statistik:** Total kelas, total siswa, total alumni (bisa diatur manual atau otomatis).
- **Pengunjung:** Statistik pengunjung website.
- **Logo:** Upload logo sekolah.
- **Media Sosial:** Link Facebook, Instagram, YouTube, dll.
- **Warna Tema:** Pengaturan warna navbar, footer, dll (jika tersedia).

**Cara Pakai:**
1. Buka menu **"Pengaturan Landing Page"**.
2. Ubah field yang diperlukan.
3. Klik **"Simpan Pengaturan"**.
4. Perubahan akan langsung tampil di landing pages.

---

### 3.25. Pengaturan NIS

**URL:** `/pengaturan-nis`  
**Akses:** Pengguna dengan permission `pengaturan_nis.view`

**Fungsi:**
- Mengatur format nomor induk siswa (NIS) otomatis.

**Pengaturan:**
- **Format NIS:** Template format (contoh: `[TAHUN_4][KODE][URUT]`).
- **Kode Sekolah:** Kode identitas sekolah.
- **Panjang Urut:** Jumlah digit nomor urut.
- **Reset Per Tahun:** Apakah nomor urut direset setiap tahun ajaran baru.

**Cara Pakai:**
1. Atur format NIS sesuai kebutuhan.
2. Lihat **Preview** untuk melihat contoh hasil format.
3. Klik "Simpan Pengaturan".

---

### 3.26. Pengaturan Penelusuran (Tracking)

**URL:** `/pengaturan-tracking`  
**Akses:** Pengguna dengan permission `pengaturan_tracking.view`

**Fungsi:**
- Mengatur apakah halaman tracking alumni terbuka untuk umum atau ditutup.

**Pengaturan:**
- **Status Buka/Tutup:** Toggle untuk membuka atau menutup akses tracking alumni.
- **Tahun Ajaran:** Pilih tahun ajaran yang terkait.

**Cara Pakai:**
1. Nyalakan toggle **"Buka Tracking"** untuk mengizinkan alumni mengisi data.
2. Matikan untuk menutup akses.
3. Pilih tahun ajaran jika diperlukan.
4. Klik "Simpan".

---

### 3.27. Manajemen Pengguna & Akses

**URL:** `/user-management`  
**Akses:** Khusus pengguna dengan role **admin**

**Fungsi:**
- Mengelola akun pengguna (admin/operator).
- Mengatur hak akses (permissions) setiap pengguna.

**Tampilan:**
- **Daftar Pengguna:** Tabel semua akun yang terdaftar.
- **Form Tambah/Edit:** Untuk menambah atau mengedit pengguna.
- **Modal Permission:** Untuk mengatur hak akses detail.

**Cara Pakai:**

#### Menambah Pengguna Baru
1. Klik **"Tambah Pengguna"**.
2. Isi:
   - **Nama:** Nama lengkap.
   - **Email:** Alamat email (digunakan untuk login).
   - **Password:** Password akun.
3. Klik "Simpan".

#### Mengatur Hak Akses (Permissions)
1. Klik ikon 🔑 pada baris pengguna.
2. Centang permission yang ingin diberikan:
   - **Per-modul:** pendaftaran, siswa, kelas, laporan, dll.
   - **Per-aksi:** view, create, edit, delete.
3. Klik "Simpan Permission".

#### Menonaktifkan/Menghapus Pengguna
- Edit pengguna untuk mengganti status aktif/non-aktif.
- Hapus pengguna jika tidak lagi digunakan.

---

## 4. CARA PENGGUNAAN UMUM

### 4.1. Login ke Dashboard

1. Buka URL dashboard (contoh: `http://localhost:5173`).
2. Secara otomatis akan redirect ke halaman landing pages.
3. Untuk login, buka `/login` atau klik tombol "Sistem Akademik" di footer landing pages.
4. Masukkan **Email** dan **Password** yang sudah terdaftar.
5. Klik **"Masuk"**.
6. Jika berhasil, akan masuk ke halaman Dashboard.

> **Catatan:** Jika lupa password, hubungi admin sekolah untuk reset password.

### 4.2. Navigasi Sidebar

Sidebar di dashboard admin terdiri dari beberapa kategori menu:

| Kategori | Menu di Dalamnya |
|----------|-----------------|
| **Menu Utama** | Dashboard, Tahun Ajaran |
| **Data Sekolah** | Pendaftar, Siswa, Kelas, Pembagian Kelas, Laporan |
| **Alumni** | Daftar Alumni, Penelusuran Alumni |
| **Tampilan Website** | Berita, Prestasi, Fasilitas, Ekstrakurikuler, Agenda, Pengumuman, Halaman, Menu Navigasi, Data Guru, Keunggulan, Program, Quotes, Testimoni, Pengaturan Landing Page |
| **Pengaturan** | Pengaturan NIS, Pengaturan Penelusuran, Pengguna & Akses |

**Tips:**
- Klik kategori untuk membuka/tutup sub-menu.
- Gunakan tombol ☰ di pojok kiri atas untuk menyembunyikan/memperkecil sidebar.
- Sidebar dapat diciutkan (collapsed) dengan toggle di header.

### 4.3. Fitur Pencarian & Filter

Hampir semua halaman data dilengkapi dengan:
- **Search Bar:** Cari data berdasarkan kata kunci (nama, NIS, NISN, dll).
- **Dropdown Filter:** Filter berdasarkan status, tahun, kategori, dll.
- **Pengaturan Jumlah Data:** Pilih jumlah data per halaman (10, 50, 100, 500, 1000).

### 4.4. Aksi Massal (Bulk Actions)

Halaman Pendaftar dan Siswa mendukung aksi massal:

1. **Centang** data yang ingin diproses (centang header untuk pilih semua).
2. Akan muncul **Action Bar** dengan pilihan:
   - **Edit Massal:** Ubah field tertentu (contoh: status) untuk semua data terpilih.
     - Mode **Massal**: Satu nilai untuk semua data.
     - Mode **Per-User**: Nilai berbeda untuk setiap data.
   - **Hapus Massal:** Hapus semua data terpilih.
3. Konfirmasi aksi yang dipilih.

### 4.5. Import Data dengan AI

Fitur import AI memungkinkan upload file Excel/CSV dengan format kolom bebas. AI akan secara cerdas memetakan kolom file ke kolom database.

**Cara Kerja:**
1. Pilih **"Import + AI"** dari menu tambah data.
2. **Upload** file Excel/CSV.
3. **Analisis:** AI membaca struktur file dan memberikan mapping rekomendasi.
4. **Mapping:** Koreksi mapping jika ada yang tidak sesuai.
5. **Preview:** Lihat pratinjau data yang akan diimport.
6. **Import:** Eksekusi import data.

**Tips:**
- Unduh **Template** terlebih dahulu jika ingin format standar.
- Pastikan file dalam format `.xlsx`, `.xls`, atau `.csv`.
- Untuk data siswa lama/alumni, pastikan memilih tahun ajaran yang sesuai.
- Fitur ini menggunakan model AI **Nvidia Nemotron** melalui OpenRouter.

### 4.6. Notifikasi

- **Ikon lonceng** di pojok kanan atas header menampilkan jumlah notifikasi yang belum dibaca.
- Notifikasi akan muncul untuk:
  - Pendaftaran baru.
  - Testimoni baru dari alumni.
  - Tracking alumni baru.
  - Prestasi baru yang diinput.
- Klik notifikasi untuk menandai sebagai dibaca dan diarahkan ke halaman terkait.
- Klik **"Tandai semua dibaca"** untuk membersihkan semua notifikasi.
- Klik **"Bersihkan Semua Notifikasi"** untuk menghapus riwayat.

---

## PENUTUP

Manual book ini mencakup seluruh fitur yang tersedia di **Sistem Informasi SMAN 1 Pamekasan**. Untuk pertanyaan lebih lanjut atau bantuan teknis, silakan hubungi admin sistem atau pengembang aplikasi.

---

*Dokumen ini dibuat berdasarkan analisis kode sumber aplikasi versi produksi.*  
*© 2025 SMAN 1 Pamekasan — All Rights Reserved.*
