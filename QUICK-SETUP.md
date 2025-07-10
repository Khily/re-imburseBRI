# 🚀 Quick Setup Guide

Panduan cepat untuk menjalankan Reimburse BBM Backend API.

## ⚡ Quick Start (5 Menit)

### 1. Setup Supabase (2 menit)
1. Buka [supabase.com](https://supabase.com) → Sign up/Login
2. Klik "New Project" → Pilih organization → Isi nama project
3. Tunggu project selesai dibuat (~2 menit)

### 2. Setup Database (1 menit)
1. Buka project Supabase → SQL Editor
2. Copy-paste script berikut dan klik "Run":

```sql
-- Buat tabel
CREATE TABLE role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_role TEXT NOT NULL UNIQUE,
  limit_role INT NOT NULL
);

CREATE TABLE user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pemilik_mobil TEXT,
  personal_number TEXT UNIQUE,
  plat_nomor TEXT UNIQUE,
  role_id UUID REFERENCES role(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false
);

CREATE TABLE reimburse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  harga_bbm INT NOT NULL,
  spedometer_sebelum INT,
  spedometer_setelah INT,
  struk_pembelian TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert sample data
INSERT INTO role (nama_role, limit_role) VALUES
('Karyawan Biasa', 500000),
('Supervisor', 750000),
('Manager', 1000000),
('Senior Manager', 1500000);
```

### 3. Setup Storage (30 detik)
1. Buka Storage → Klik "New bucket"
2. Nama: `struk-pembelian`
3. Centang "Public bucket" → Create

### 4. Setup Environment (1 menit)
1. Copy file environment:
```bash
cp .env.example .env
```

2. Buka Supabase → Settings → API → Copy informasi berikut ke `.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
JWT_SECRET=my_super_secure_jwt_secret_key_32_chars_minimum
PORT=3000
NODE_ENV=development
STORAGE_BUCKET=struk-pembelian
```

### 5. Install & Run (30 detik)
```bash
npm install
npm run dev
```

✅ **Server berjalan di http://localhost:3000**

## 🧪 Test API

### Buat Admin User
```bash
POST http://localhost:3000/api/auth/register
{
  "email": "admin@test.com",
  "password": "admin123",
  "pemilik_mobil": "Admin User",
  "personal_number": "ADM001",
  "plat_nomor": "B1234ADM"
}
```

### Set sebagai Admin (di SQL Editor Supabase)
```sql
UPDATE user_profile SET is_admin = true WHERE personal_number = 'ADM001';
```

### Login
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "admin@test.com", 
  "password": "admin123"
}
```

### Test Admin Endpoint
```bash
GET http://localhost:3000/api/admin/role
Authorization: Bearer <your_token_here>
```

## 🎯 Next Steps

1. **Baca API Documentation**: Lihat `api-testing.md` untuk contoh lengkap
2. **Test dengan Postman**: Import collection untuk testing
3. **Customize**: Sesuaikan business logic sesuai kebutuhan
4. **Deploy**: Deploy ke Heroku, Railway, atau platform pilihan

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan file `.env` ada dan terisi dengan benar
- Jalankan `npm run check-env` untuk validasi

### Error: "Invalid URL"
- Periksa format `SUPABASE_URL` di file `.env`
- Harus format: `https://your-project-id.supabase.co`

### Error: "JWT_SECRET should be at least 32 characters"
- Buat JWT secret yang lebih panjang
- Contoh: `my_super_secure_jwt_secret_key_32_characters_minimum`

### Error saat upload file
- Pastikan bucket `struk-pembelian` sudah dibuat di Supabase Storage
- Pastikan bucket di-set sebagai "Public"

## 📞 Support

Jika ada masalah:
1. Cek file `README.md` untuk dokumentasi lengkap
2. Lihat `database-setup.md` untuk setup database detail
3. Periksa `api-testing.md` untuk contoh testing API
