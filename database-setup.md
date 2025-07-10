# Sample SQL untuk Setup Database dan Data Awal

## 1. Buat Tabel (Jalankan di SQL Editor Supabase)

```sql
-- Tabel role
CREATE TABLE role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_role TEXT NOT NULL UNIQUE,
  limit_role INT NOT NULL
);

-- Tabel user_profile (terhubung ke auth.users)
CREATE TABLE user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pemilik_mobil TEXT,
  personal_number TEXT UNIQUE,
  plat_nomor TEXT UNIQUE,
  role_id UUID REFERENCES role(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false
);

-- Tabel reimburse
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
```

## 2. Insert Data Sample Role

```sql
INSERT INTO role (nama_role, limit_role) VALUES
('Karyawan Biasa', 500000),
('Supervisor', 750000),
('Manager', 1000000),
('Senior Manager', 1500000);
```

## 2.1. Migrasi Database (Jika Tabel Sudah Ada)

Jika tabel `reimburse` sudah ada dan perlu ditambahkan kolom baru:

```sql
-- Tambahkan kolom baru ke tabel reimburse
ALTER TABLE reimburse 
ADD COLUMN jenis_bbm TEXT,
ADD COLUMN harga_per_liter INT,
ADD COLUMN jumlah_liter_bbm DECIMAL(10,2);

-- Update kolom menjadi NOT NULL setelah mengisi data
-- (Opsional: isi data default untuk record yang sudah ada)
UPDATE reimburse 
SET jenis_bbm = 'Pertalite', 
    harga_per_liter = 10000, 
    jumlah_liter_bbm = harga_bbm / 10000.0
WHERE jenis_bbm IS NULL;

-- Set kolom menjadi NOT NULL
ALTER TABLE reimburse 
ALTER COLUMN jenis_bbm SET NOT NULL,
ALTER COLUMN harga_per_liter SET NOT NULL,
ALTER COLUMN jumlah_liter_bbm SET NOT NULL;
```

## 3. Setup RLS (Row Level Security) Policies

```sql
-- Enable RLS untuk semua tabel
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimburse ENABLE ROW LEVEL SECURITY;

-- Policy untuk role (admin can read/write, users can only read)
CREATE POLICY "Admin can manage roles" ON role
  FOR ALL USING (auth.jwt() ->> 'is_admin' = 'true');

CREATE POLICY "Users can view roles" ON role
  FOR SELECT USING (true);

-- Policy untuk user_profile (users can read own profile, admin can manage all)
CREATE POLICY "Users can view own profile" ON user_profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles" ON user_profile
  FOR ALL USING (auth.jwt() ->> 'is_admin' = 'true');

-- Policy untuk reimburse (users can manage own data, admin can view all)
CREATE POLICY "Users can manage own reimburse" ON reimburse
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all reimburse" ON reimburse
  FOR SELECT USING (auth.jwt() ->> 'is_admin' = 'true');
```

## 4. Storage Bucket Setup

1. Buka Supabase Dashboard → Storage
2. Buat bucket baru dengan nama: `struk-pembelian`
3. Set bucket sebagai "Public"
4. Set policy bucket:

```sql
-- Policy untuk upload file (users can upload own files)
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'struk-pembelian' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy untuk download file (public access)
CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'struk-pembelian');
```

## 5. Sample Data untuk Testing

Setelah server berjalan, gunakan endpoint berikut untuk membuat data sample:

### Membuat Admin User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123",
  "pemilik_mobil": "John Admin",
  "personal_number": "ADM001",
  "plat_nomor": "B1234ADM"
}
```

Kemudian update is_admin menjadi true di database:
```sql
UPDATE user_profile SET is_admin = true WHERE personal_number = 'ADM001';
```

### Membuat User Biasa
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user1@company.com",
  "password": "user123",
  "pemilik_mobil": "Jane User",
  "personal_number": "USR001", 
  "plat_nomor": "B5678USR",
  "role_id": "uuid-role-karyawan-biasa"
}
```
