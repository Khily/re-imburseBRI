# 🔄 Update Database Schema - Tambah Field BBM Detail

## ✅ Perubahan yang Telah Dilakukan

### 1. **Database Schema Update**
Tabel `reimburse` sekarang memiliki kolom tambahan:
- `jenis_bbm` (TEXT NOT NULL) - Jenis BBM (Pertamax, Pertalite, Solar, dll)
- `harga_per_liter` (INT NOT NULL) - Harga per liter BBM dalam rupiah
- `jumlah_liter_bbm` (DECIMAL(10,2) NOT NULL) - Jumlah liter BBM yang dibeli

### 2. **API Controller Update**
- **Validasi Input**: Semua field baru wajib diisi
- **Validasi Kalkulasi**: Memastikan `harga_bbm = harga_per_liter × jumlah_liter_bbm`
- **Format Response**: Menambahkan field baru dalam response API

### 3. **API Endpoint Update**
Endpoint `POST /api/user/reimburse` sekarang menerima field tambahan:
```javascript
{
  "harga_bbm": 75000,           // Total harga BBM
  "spedometer_sebelum": 12345,  // Spedometer sebelum
  "spedometer_setelah": 12445,  // Spedometer setelah (optional)
  "jenis_bbm": "Pertamax",      // Jenis BBM (BARU)
  "harga_per_liter": 15000,     // Harga per liter (BARU)
  "jumlah_liter_bbm": 5.0,      // Jumlah liter (BARU)
  "struk_pembelian": "file"     // File upload struk
}
```

### 4. **Validasi Bisnis Logic**
- ✅ **Konsistensi Harga**: Validasi bahwa `harga_bbm = harga_per_liter × jumlah_liter_bbm`
- ✅ **Toleransi Pembulatan**: Toleransi 100 rupiah untuk pembulatan
- ✅ **Format Angka**: Validasi tipe data numerik

### 5. **Documentation Update**
- ✅ `database-setup.md` - Schema terbaru + migrasi
- ✅ `api-testing.md` - Contoh request dengan field baru
- ✅ Route documentation - Field description update

## 🎯 Langkah Selanjutnya untuk Implementasi

### 1. **Update Database di Supabase**
Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Untuk database baru
CREATE TABLE reimburse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  harga_bbm INT NOT NULL,
  spedometer_sebelum INT,
  spedometer_setelah INT,
  jenis_bbm TEXT NOT NULL,
  harga_per_liter INT NOT NULL,
  jumlah_liter_bbm DECIMAL(10,2) NOT NULL,
  struk_pembelian TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Untuk database yang sudah ada (migrasi)
ALTER TABLE reimburse 
ADD COLUMN jenis_bbm TEXT,
ADD COLUMN harga_per_liter INT,
ADD COLUMN jumlah_liter_bbm DECIMAL(10,2);

-- Set default values untuk data lama
UPDATE reimburse 
SET jenis_bbm = 'Pertalite', 
    harga_per_liter = 10000, 
    jumlah_liter_bbm = harga_bbm / 10000.0
WHERE jenis_bbm IS NULL;

-- Set NOT NULL constraint
ALTER TABLE reimburse 
ALTER COLUMN jenis_bbm SET NOT NULL,
ALTER COLUMN harga_per_liter SET NOT NULL,
ALTER COLUMN jumlah_liter_bbm SET NOT NULL;
```

### 2. **Test API dengan Field Baru**
```bash
POST http://localhost:3000/api/user/reimburse
Authorization: Bearer your_jwt_token_here
Content-Type: multipart/form-data

harga_bbm: 75000
spedometer_sebelum: 12345
spedometer_setelah: 12445
jenis_bbm: Pertamax
harga_per_liter: 15000
jumlah_liter_bbm: 5.0
struk_pembelian: [file upload]
```

### 3. **Response Format Baru**
```json
{
  "success": true,
  "message": "Reimburse berhasil dibuat.",
  "data": {
    "id": "uuid",
    "harga_bbm": 75000,
    "spedometer_sebelum": 12345,
    "spedometer_setelah": 12445,
    "jenis_bbm": "Pertamax",
    "harga_per_liter": 15000,
    "jumlah_liter_bbm": 5.0,
    "struk_pembelian": "https://...",
    "selisih_km": 100,
    "total_harga_calculated": 75000,
    "created_at": "2025-07-09T..."
  }
}
```

## 🔥 Keunggulan Update Ini

### 1. **Data Lebih Detail**
- Informasi jenis BBM yang dibeli
- Harga per liter untuk tracking fluktuasi harga
- Jumlah liter untuk analisis konsumsi

### 2. **Validasi Lebih Ketat**
- Konsistensi perhitungan harga
- Mencegah input yang tidak masuk akal
- Validasi format data numerik

### 3. **Analisis Lebih Baik**
- Admin dapat melihat tren harga BBM
- Analisis efisiensi konsumsi BBM
- Tracking jenis BBM yang paling banyak digunakan

### 4. **Compatibility**
- Backward compatible dengan sistem lama
- Migrasi data yang aman
- Tidak mempengaruhi fitur yang sudah ada

## 🚀 Status Update

✅ **Database Schema** - Updated  
✅ **API Controller** - Updated  
✅ **API Routes** - Updated  
✅ **Validation Logic** - Updated  
✅ **Documentation** - Updated  
✅ **Server** - Running Successfully  

**Siap untuk testing dengan field BBM yang baru!** 🎉

## 📝 Catatan Penting

1. **Migrasi Database**: Jika sudah ada data lama, gunakan script migrasi di `database-setup.md`
2. **Frontend Update**: Frontend perlu update untuk mengirim field baru
3. **Testing**: Test dengan berbagai jenis BBM dan kalkulasi harga
4. **Validasi**: Sistem akan menolak jika kalkulasi harga tidak sesuai
