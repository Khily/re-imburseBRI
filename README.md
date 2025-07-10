# Backend API untuk Aplikasi Reimbursement BBM

Backend API yang lengkap dan terstruktur menggunakan Node.js, Express.js, dan Supabase untuk aplikasi reimbursement BBM.

## 🚀 Fitur Utama

- **Otentikasi & Otorisasi**: Login/logout dengan JWT dan role-based access control
- **Kelola Role**: CRUD operations untuk role dengan limit reimburse
- **Kelola User**: CRUD operations untuk user dengan profile lengkap
- **Reimburse BBM**: Upload struk, validasi limit, dan tracking history
- **File Upload**: Upload dan penyimpanan struk pembelian ke Supabase Storage
- **Filter Data**: Filter data berdasarkan hari ini, kemarin, atau bulan ini

## 🏗️ Struktur Proyek

```
/reimburse-backend
|-- /src
|   |-- /api                     # Routing layer
|   |   |-- auth.routes.js       # Routes untuk autentikasi
|   |   |-- admin.routes.js      # Routes untuk admin
|   |   `-- user.routes.js       # Routes untuk user
|   |
|   |-- /controllers             # Business logic layer
|   |   |-- auth.controller.js   # Logic autentikasi
|   |   |-- role.controller.js   # Logic kelola role
|   |   |-- user.controller.js   # Logic kelola user
|   |   `-- reimburse.controller.js # Logic reimburse
|   |
|   |-- /middlewares             # Middleware layer
|   |   `-- auth.middleware.js   # Auth & admin verification
|   |
|   |-- /config                  # Configuration layer
|   |   `-- supabase.js          # Supabase client setup
|   |
|   `-- server.js                # Main server file
|
|-- .env                         # Environment variables
|-- package.json                 # Dependencies & scripts
`-- README.md                    # Documentation
```

## 📊 Database Schema

### Tabel `role`
```sql
CREATE TABLE role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_role TEXT NOT NULL UNIQUE,
  limit_role INT NOT NULL
);
```

### Tabel `user_profile`
```sql
CREATE TABLE user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pemilik_mobil TEXT,
  personal_number TEXT UNIQUE,
  plat_nomor TEXT UNIQUE,
  role_id UUID REFERENCES role(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false
);
```

### Tabel `reimburse`
```sql
CREATE TABLE reimburse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  harga_bbm INT NOT NULL,
  spedometer_sebelum INT,
  spedometer_setelah INT,
  struk_pembelian TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Supabase Storage Bucket
- Bucket name: `struk-pembelian`
- Access: Public
- Purpose: Menyimpan file struk pembelian BBM

## 🛠️ Setup & Installation

### 1. Prerequisites
- Node.js (v16 atau lebih baru)
- NPM atau Yarn
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

### 2. Clone & Install Dependencies
```bash
# Install dependencies
npm install
```

### 3. Setup Supabase Database
1. Buat project baru di [Supabase Dashboard](https://app.supabase.com)
2. Buka SQL Editor dan jalankan perintah untuk membuat tabel:

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
  struk_pembelian TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert sample roles
INSERT INTO role (nama_role, limit_role) VALUES
('Karyawan Biasa', 500000),
('Supervisor', 750000),
('Manager', 1000000),
('Senior Manager', 1500000);
```

3. Buat Storage Bucket:
   - Buka Storage di Supabase Dashboard
   - Buat bucket baru dengan nama: `struk-pembelian`
   - Set bucket sebagai "Public"

### 4. Setup Environment Variables
1. Salin file environment example:
```bash
cp .env.example .env
```

2. Edit file `.env` dan isi dengan konfigurasi Supabase Anda:
```env
# Dapatkan dari Settings > API di Supabase Dashboard
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Buat JWT secret yang aman (minimal 32 karakter)
JWT_SECRET=your_very_secure_jwt_secret_key_at_least_32_characters_long

# Server Configuration
PORT=3000
NODE_ENV=development
STORAGE_BUCKET=struk-pembelian
```

### 5. Jalankan Server
```bash
# Development mode dengan environment validation
npm run dev

# Development mode langsung (tanpa validation)
npm run dev:direct

# Production mode
npm start

# Check environment configuration only
npm run check-env
```

Server akan berjalan di `http://localhost:3000`

### 6. Buat User Admin (Optional)
Setelah server berjalan, buat admin user:

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123",
  "pemilik_mobil": "Admin User",
  "personal_number": "ADM001",
  "plat_nomor": "B1234ADM"
}
```

Kemudian update menjadi admin di database:
```sql
UPDATE user_profile SET is_admin = true WHERE personal_number = 'ADM001';
```

## 📡 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/register` | Register user (dev only) |

### Admin Endpoints (Requires Admin Access)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/role` | Get all roles |
| POST | `/api/admin/role` | Create new role |
| PUT | `/api/admin/role/:id` | Update role |
| DELETE | `/api/admin/role/:id` | Delete role |
| GET | `/api/admin/user` | Get all users |
| POST | `/api/admin/user` | Create new user |
| PUT | `/api/admin/user/:id` | Update user |
| DELETE | `/api/admin/user/:id` | Delete user |
| GET | `/api/admin/reimburse` | Get all reimbursements |

### User Endpoints (Requires Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/limit` | Get user limit info |
| POST | `/api/user/reimburse` | Create reimbursement |
| GET | `/api/user/reimburse/history` | Get reimbursement history |

### Query Parameters
- `filter`: Filter data berdasarkan waktu
  - `today`: Data hari ini
  - `yesterday`: Data kemarin  
  - `this_month`: Data bulan ini

## 📝 API Request Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Create Reimbursement
```bash
POST /api/user/reimburse
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

harga_bbm: 50000
spedometer_sebelum: 12345
spedometer_setelah: 12445
struk_pembelian: <file>
```

### Get Admin Reimbursement Data
```bash
GET /api/admin/reimburse?filter=today
Authorization: Bearer <access_token>
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin vs User permissions
- **File Upload Validation**: Type and size restrictions
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Structured error responses

## 🧩 Dependencies

### Main Dependencies
- **express**: Web framework untuk Node.js
- **@supabase/supabase-js**: Supabase client library
- **jsonwebtoken**: JWT implementation
- **multer**: File upload middleware
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable loader

### Dev Dependencies
- **nodemon**: Development server dengan auto-reload

## 📈 Development

### File Structure Explained
- **`/api`**: Routing layer yang menentukan endpoint dan middleware
- **`/controllers`**: Business logic layer yang memproses request
- **`/middlewares`**: Custom middleware untuk authentication dan validation
- **`/config`**: Configuration files untuk database dan external services

### Adding New Features
1. Buat controller baru di `/controllers`
2. Buat routes baru di `/api`
3. Tambahkan middleware jika diperlukan
4. Update dokumentasi API

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

ISC License - lihat file LICENSE untuk detail.
