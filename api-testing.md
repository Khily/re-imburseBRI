# API Testing Examples

## Authentication

### 1. Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "pemilik_mobil": "John Admin",
      "personal_number": "ADM001",
      "plat_nomor": "B1234ADM",
      "is_admin": true,
      "role": {
        "nama_role": "Manager",
        "limit_role": 1000000
      }
    },
    "session": {
      "access_token": "jwt_token_here",
      "refresh_token": "refresh_token_here"
    }
  }
}
```

### 2. Register (Development)
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user2@company.com",
  "password": "user123",
  "pemilik_mobil": "Bob User",
  "personal_number": "USR002",
  "plat_nomor": "B9999USR"
}
```

## Admin Endpoints

### 1. Get All Roles
```bash
GET http://localhost:3000/api/admin/role
Authorization: Bearer your_jwt_token_here
```

### 2. Create Role
```bash
POST http://localhost:3000/api/admin/role
Authorization: Bearer your_jwt_token_here
Content-Type: application/json

{
  "nama_role": "Director",
  "limit_role": 2000000
}
```

### 3. Get All Users
```bash
GET http://localhost:3000/api/admin/user
Authorization: Bearer your_jwt_token_here
```

### 4. Create User
```bash
POST http://localhost:3000/api/admin/user
Authorization: Bearer your_jwt_token_here
Content-Type: application/json

{
  "email": "newuser@company.com",
  "password": "newuser123",
  "pemilik_mobil": "New User",
  "personal_number": "USR003",
  "plat_nomor": "B3333USR",
  "role_id": "uuid-of-role",
  "is_admin": false
}
```

### 5. Get All Reimbursements
```bash
GET http://localhost:3000/api/admin/reimburse
Authorization: Bearer your_jwt_token_here
```

### 6. Get Reimbursements with Filter
```bash
GET http://localhost:3000/api/admin/reimburse?filter=today
Authorization: Bearer your_jwt_token_here
```

## User Endpoints

### 1. Get User Limit
```bash
GET http://localhost:3000/api/user/limit
Authorization: Bearer your_jwt_token_here
```

Response:
```json
{
  "success": true,
  "message": "Data limit berhasil diambil.",
  "data": {
    "user": {
      "pemilik_mobil": "Jane User",
      "personal_number": "USR001",
      "plat_nomor": "B5678USR"
    },
    "role": {
      "nama_role": "Karyawan Biasa",
      "limit_role": 500000
    },
    "limit": {
      "total_limit": 500000,
      "used_this_month": 150000,
      "remaining_limit": 350000,
      "month": 7,
      "year": 2025
    }
  }
}
```

### 2. Create Reimbursement (with file upload)
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
struk_pembelian: [file upload - image file]
```

Response:
```json
{
  "success": true,
  "message": "Reimburse berhasil dibuat.",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "harga_bbm": 75000,
    "spedometer_sebelum": 12345,
    "spedometer_setelah": 12445,
    "jenis_bbm": "Pertamax",
    "harga_per_liter": 15000,
    "jumlah_liter_bbm": 5.0,
    "struk_pembelian": "https://...",
    "created_at": "2025-07-09T...",
    "selisih_km": 100,
    "total_harga_calculated": 75000
  }
}
```

### 3. Get Reimbursement History
```bash
GET http://localhost:3000/api/user/reimburse/history
Authorization: Bearer your_jwt_token_here
```

### 4. Get History with Filter
```bash
GET http://localhost:3000/api/user/reimburse/history?filter=this_month
Authorization: Bearer your_jwt_token_here
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak ditemukan. Silakan login terlebih dahulu."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akses ditolak. Hanya admin yang dapat mengakses endpoint ini."
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email dan password harus diisi."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route GET /api/invalid tidak ditemukan."
}
```

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### Upload Reimbursement Example
```bash
curl -X POST http://localhost:3000/api/user/reimburse \
  -H "Authorization: Bearer your_jwt_token_here" \
  -F "harga_bbm=75000" \
  -F "spedometer_sebelum=12345" \
  -F "spedometer_setelah=12445" \
  -F "jenis_bbm=Pertamax" \
  -F "harga_per_liter=15000" \
  -F "jumlah_liter_bbm=5.0" \
  -F "struk_pembelian=@/path/to/your/receipt.jpg"
```

## Testing with Postman

1. Create a new collection "Reimburse API"
2. Add environment variables:
   - `base_url`: http://localhost:3000
   - `auth_token`: (will be set after login)
3. Create requests for each endpoint
4. Use Postman's form-data for file uploads
5. Set Authorization header as `Bearer {{auth_token}}`
