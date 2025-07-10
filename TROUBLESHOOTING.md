# Troubleshooting Guide - Reimburse BBM API

## Error: "Email atau password salah" (Login)

### Kemungkinan Penyebab:
1. **Email belum dikonfirmasi** - User terdaftar tapi email belum diverifikasi
2. **Case sensitivity** - Email harus sama persis dengan yang digunakan saat registrasi
3. **Password salah** - Password tidak match dengan yang di database
4. **User tidak ada** - User belum terdaftar di database

### Solusi:

#### 1. Cek Status Email Confirmation
```bash
node email-confirm.js --list
```

#### 2. Konfirmasi Email User (Development Only)
```bash
node email-confirm.js --confirm
```

#### 3. Pastikan Email Case Match
- Gunakan email yang sama persis dengan saat registrasi
- Supabase kadang case-sensitive untuk email
- Contoh: `user1234@gmail.com` ≠ `User1234@gmail.com`

#### 4. Reset Password (jika perlu)
```javascript
// Via Supabase dashboard atau script
const { data, error } = await supabase.auth.resetPasswordForEmail(email);
```

### Contoh Login yang Benar:
```json
{
  "email": "user1234@gmail.com", 
  "password": "password123"
}
```

---

## Error: "Semua field harus diisi"

### 1. Endpoint Register User
**Error Message:** `Semua field harus diisi.`

**Required Fields:**
- `email` (string): Email pengguna
- `password` (string): Password pengguna
- `pemilik_mobil` (string): Nama pemilik mobil
- `personal_number` (string): Nomor personal/karyawan
- `plat_nomor` (string): Plat nomor kendaraan

**Contoh Request Body yang Benar:**
```json
{
  "email": "test@gmail.com",
  "password": "password123",
  "pemilik_mobil": "Test User",
  "personal_number": "TST001",
  "plat_nomor": "B9999TST"
}
```

### 2. Endpoint Upload Reimburse
**Error Message:** `Semua field harus diisi: harga_bbm, spedometer_sebelum, jenis_bbm, harga_per_liter, jumlah_liter_bbm, dan struk_pembelian.`

**Required Fields:**
- `harga_bbm` (number): Total harga BBM yang dibeli
- `spedometer_sebelum` (number): Angka spedometer sebelum pengisian
- `jenis_bbm` (string): Jenis BBM (Pertamax, Pertalite, dll)
- `harga_per_liter` (number): Harga per liter BBM
- `jumlah_liter_bbm` (number): Jumlah liter BBM yang dibeli
- `struk_pembelian` (file): File gambar struk pembelian

**Optional Fields:**
- `spedometer_setelah` (number): Angka spedometer setelah pengisian

## Cara Mengatasi Error di Postman

### 1. Pastikan Content-Type Header
- Untuk JSON request: `Content-Type: application/json`
- Untuk form-data request: Jangan set Content-Type (biarkan Postman auto-detect)

### 2. Validasi Field di Postman

#### Register User:
1. Buka tab **Body** > **raw** > **JSON**
2. Pastikan semua field required ada:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "pemilik_mobil": "Nama Lengkap",
  "personal_number": "EMP001",
  "plat_nomor": "B1234ABC"
}
```

#### Upload Reimburse:
1. Buka tab **Body** > **form-data**
2. Tambahkan semua field berikut:

| Key | Value | Type |
|-----|-------|------|
| harga_bbm | 75000 | Text |
| spedometer_sebelum | 12345 | Text |
| spedometer_setelah | 12445 | Text |
| jenis_bbm | Pertamax | Text |
| harga_per_liter | 15000 | Text |
| jumlah_liter_bbm | 5.0 | Text |
| struk_pembelian | [pilih file] | File |

3. **PENTING**: Pastikan file struk_pembelian sudah dipilih (tidak kosong)

### 3. Validasi Authentication
Pastikan token authorization valid:
```
Authorization: Bearer [your_token_here]
```

### 4. Troubleshooting Checklist

#### Sebelum Testing:
- [ ] Server sudah berjalan di port 3000
- [ ] Database Supabase sudah terkoneksi
- [ ] File .env sudah dikonfigurasi dengan benar
- [ ] Token authorization sudah didapat dari endpoint login

#### Saat Testing Register:
- [ ] Semua 5 field wajib sudah diisi
- [ ] Format email valid
- [ ] Password minimal 6 karakter
- [ ] Content-Type: application/json

#### Saat Testing Upload Reimburse:
- [ ] Semua 6 field wajib sudah diisi
- [ ] File struk_pembelian sudah dipilih
- [ ] Token authorization sudah diset
- [ ] Nilai numerik dalam format yang benar

## Tips Debugging

### 1. Check Request di Console
Buka Postman Console untuk melihat request yang dikirim:
- View > Show Postman Console
- Kirim request dan lihat detail request body

### 2. Validasi Response
```json
// Response Success
{
  "success": true,
  "message": "Pesan sukses",
  "data": {...}
}

// Response Error
{
  "success": false,
  "message": "Pesan error"
}
```

### 3. Common Issues

#### Issue: Field tidak terdeteksi
**Solution:** Pastikan key field di form-data atau JSON sama persis dengan yang required

#### Issue: File upload gagal
**Solution:** 
- Pastikan file size < 5MB
- Format file: jpg, jpeg, png, pdf
- Field name: `struk_pembelian`

#### Issue: Token expired
**Solution:** Login ulang untuk mendapatkan token baru

#### Issue: Validation error
**Solution:** Periksa format data:
- Angka jangan dikasih tanda kutip di form-data
- String harus valid (tidak kosong)

## Contoh Error Response dan Solusi

### Error: "Semua field harus diisi"
**Kemungkinan Penyebab:**
1. Ada field yang tidak diisi
2. Nama field salah (typo)
3. Field terkirim sebagai null/undefined

**Solusi:**
1. Periksa semua field wajib sudah diisi
2. Pastikan nama field sama persis
3. Pastikan tidak ada field yang kosong

### Error: "Format angka tidak valid"
**Kemungkinan Penyebab:**
1. Angka dikasih tanda kutip di form-data
2. Value berisi karakter non-numerik

**Solusi:**
1. Di form-data, masukkan angka tanpa tanda kutip
2. Pastikan value hanya berisi angka

### Error: "Token authorization tidak valid"
**Kemungkinan Penyebab:**
1. Token expired
2. Token format salah
3. Token tidak diset

**Solusi:**
1. Login ulang untuk mendapatkan token baru
2. Pastikan format: `Bearer [token]`
3. Set token di Authorization header

## Need Help?

Jika masih ada error, cek:
1. Server logs di terminal
2. Postman Console logs
3. Network tab di browser (jika menggunakan web request)
4. Supabase dashboard untuk error database

Pastikan semua field sesuai dengan dokumentasi API dan format data yang benar.
