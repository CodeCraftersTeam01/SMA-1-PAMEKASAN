# User Management API & Web Interface

## Overview

Saya telah membuat sistem lengkap untuk **Manajemen Pengguna** di aplikasi SMA 1 Pamekasan. Sistem ini mencakup:

1. **Backend API** (Laravel Lumen)
2. **Frontend Web Interface** (React)

---

## Backend (API)

### Controller: UserController

**File:** `BackendLumen/app/Http/Controllers/UserController.php`

#### Fitur Utama:

1. **GET /api/users** - Mendapatkan daftar semua pengguna
   - Response: Array dari semua user

2. **GET /api/users/{id}** - Mendapatkan detail pengguna berdasarkan ID
   - Parameter: `id` (integer)
   - Response: Data user spesifik

3. **POST /api/users** - Membuat pengguna baru
   - Required fields:
     - `name` (string, max 255)
     - `email` (string, email, unique)
     - `password` (string, min 8)
     - `role` (enum: 'admin', 'petugas')
   - Response: Data user yang baru dibuat

4. **PUT /api/users/{id}** - Mengupdate data pengguna
   - Parameter: `id` (integer)
   - Optional fields:
     - `name`
     - `email`
     - `password` (jika ingin mengubah)
     - `role`
   - Response: Data user yang sudah diupdate

5. **DELETE /api/users/{id}** - Menghapus pengguna
   - Parameter: `id` (integer)
   - Protection: Pengguna tidak bisa menghapus dirinya sendiri
   - Response: Pesan sukses/error

### Routes

**File:** `BackendLumen/routes/web.php`

```php
// Routes untuk User Management
$router->get('users', 'UserController@index');
$router->get('users/{id}', 'UserController@show');
$router->post('users', 'UserController@store');
$router->put('users/{id}', 'UserController@update');
$router->delete('users/{id}', 'UserController@destroy');
```

Semua routes **memerlukan autentikasi** (Bearer Token JWT).

---

## Frontend (React)

### Pages & Components

**Lokasi:** `Frontend/src/pages/user-management/`

#### 1. Main Page: `index.jsx`

- Komponen utama untuk user management
- Fitur:
  - Menampilkan list pengguna
  - Form untuk tambah/edit pengguna
  - Notifikasi toast
  - Loading states

#### 2. Component: `UserList.jsx`

- Menampilkan tabel daftar pengguna
- Fitur:
  - Table dengan kolom: No, Nama, Email, Role, Tanggal Dibuat, Aksi
  - Avatar user dengan initial nama
  - Badge untuk role (Admin/Petugas)
  - Tombol Edit dan Delete

#### 3. Component: `UserForm.jsx`

- Form untuk membuat dan edit pengguna
- Fitur:
  - Validasi form (client-side)
  - Input fields: Nama, Email, Password, Konfirmasi Password, Role
  - Error messages
  - Loading state saat submit

### Navigasi

**File:** `Frontend/src/App.jsx`

Route ditambahkan: `/user-management`

**File:** `Frontend/src/components/layout/DashboardLayout.jsx`

Menu item ditambahkan di bagian "Pengaturan" dengan label "Manajemen Pengguna"

---

## Cara Menggunakan

### Via Frontend

1. Login ke aplikasi
2. Di sidebar, pilih **"Manajemen Pengguna"** di bagian Pengaturan
3. Anda akan melihat:
   - List semua pengguna
   - Tombol "Tambah Pengguna Baru"

#### Membuat Pengguna Baru:
- Klik tombol "Tambah Pengguna Baru"
- Isi form dengan data pengguna
- Pilih role (Admin atau Petugas)
- Klik "Tambah Pengguna"

#### Edit Pengguna:
- Klik tombol "Edit" di baris pengguna
- Ubah data yang diperlukan
- Password bisa dikosongkan jika tidak ingin mengubah
- Klik "Simpan Perubahan"

#### Hapus Pengguna:
- Klik tombol "Hapus" di baris pengguna
- Konfirmasi penghapusan
- Pengguna akan dihapus dari database

### Via API (cURL/Postman)

#### 1. Get All Users
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### 2. Get User by ID
```bash
curl -X GET http://localhost:8000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### 3. Create User
```bash
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "petugas"
  }'
```

#### 4. Update User
```bash
curl -X PUT http://localhost:8000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "admin"
  }'
```

#### 5. Delete User
```bash
curl -X DELETE http://localhost:8000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Data Model

### User Model
**File:** `BackendLumen/app/Models/User.php`

```php
protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'photo',
];
```

### User Fields
- `id` - Primary key
- `name` - Nama pengguna (string)
- `email` - Email pengguna (string, unique)
- `password` - Password terenkripsi (hashed)
- `role` - Role pengguna (enum: 'admin', 'petugas')
- `photo` - Photo path (nullable)
- `created_at` - Timestamp dibuat
- `updated_at` - Timestamp terakhir diupdate

---

## Validasi & Error Handling

### Backend Validation
- `name`: required, string, max 255 characters
- `email`: required, email format, unique di database
- `password`: required untuk create, min 8 characters
- `role`: required, enum (admin/petugas)

### Error Responses
- **422 Unprocessable Entity** - Validasi gagal
- **404 Not Found** - User tidak ditemukan
- **403 Forbidden** - Tidak boleh menghapus user sendiri
- **500 Internal Server Error** - Error server

### Frontend Validation
- Client-side validation sebelum submit
- Error messages ditampilkan di form
- Toast notifications untuk feedback

---

## Security Features

1. **JWT Authentication** - Semua endpoints memerlukan token JWT valid
2. **Password Hashing** - Password disimpan menggunakan bcrypt
3. **Email Unique** - Mencegah duplikasi email
4. **Self-Protection** - User tidak bisa menghapus dirinya sendiri
5. **CORS Ready** - API siap untuk frontend

---

## Response Examples

### Success Create User (201)
```json
{
  "message": "Pengguna berhasil ditambahkan",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "petugas",
    "created_at": "2024-05-07T10:30:00.000000Z",
    "updated_at": "2024-05-07T10:30:00.000000Z"
  }
}
```

### Success Get All Users (200)
```json
{
  "message": "Data pengguna berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2024-05-07T10:30:00.000000Z",
      "updated_at": "2024-05-07T10:30:00.000000Z"
    }
  ]
}
```

### Error Validation (422)
```json
{
  "message": "Validasi gagal",
  "errors": {
    "email": [
      "Email sudah digunakan"
    ],
    "password": [
      "Password minimal 8 karakter"
    ]
  }
}
```

---

## Testing Checklist

- [ ] Akses menu "Manajemen Pengguna" di sidebar
- [ ] Lihat list semua pengguna
- [ ] Klik "Tambah Pengguna Baru"
- [ ] Isi form dan klik "Tambah Pengguna"
- [ ] Verifikasi pengguna baru muncul di list
- [ ] Klik "Edit" pada pengguna
- [ ] Ubah data dan klik "Simpan Perubahan"
- [ ] Verifikasi perubahan tersimpan
- [ ] Klik "Hapus" pada pengguna
- [ ] Konfirmasi dan verifikasi pengguna terhapus

---

## Troubleshooting

### API Returns 401 Unauthorized
- Pastikan token JWT valid
- Pastikan Bearer token format benar di header

### API Returns 422 Validation Error
- Periksa format data yang dikirim
- Pastikan email belum terdaftar (untuk create)
- Pastikan password minimal 8 karakter

### Frontend Tidak Menampilkan Data
- Pastikan backend berjalan
- Cek VITE_API_BASE_URL di `.env.local`
- Buka browser console untuk error logs

---

## Catatan

- Sistem user management terintegrasi penuh dengan auth JWT yang sudah ada
- Semua UI menggunakan Tailwind CSS dan mengikuti design system yang sudah ada
- Animasi dan transitions menggunakan Framer Motion
- Form validation dilakukan di client dan server
- Password selalu di-hash sebelum disimpan

Selamat! Sistem manajemen pengguna sudah siap digunakan! 🎉
