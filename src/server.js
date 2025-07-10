const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./api/auth.routes');
const adminRoutes = require('./api/admin.routes');
const userRoutes = require('./api/user.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====
// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reimburse BBM API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// ===== ERROR HANDLING =====
// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Terjadi kesalahan server internal.',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ===== SERVER START =====
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 REIMBURSE BBM API SERVER');
  console.log('='.repeat(50));
  console.log(`📡 Server berjalan di: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Storage Bucket: ${process.env.STORAGE_BUCKET || 'struk-pembelian'}`);
  console.log('='.repeat(50));
  console.log('📋 Available Endpoints:');
  console.log('  GET  /                     - Health check');
  console.log('  POST /api/auth/login       - Login user');
  console.log('  POST /api/auth/logout      - Logout user');
  console.log('  POST /api/auth/register    - Register user (dev)');
  console.log('');
  console.log('  🔧 Admin Endpoints (requires admin access):');
  console.log('  GET    /api/admin/role         - Get all roles');
  console.log('  POST   /api/admin/role         - Create role');
  console.log('  PUT    /api/admin/role/:id     - Update role');
  console.log('  DELETE /api/admin/role/:id     - Delete role');
  console.log('  GET    /api/admin/user         - Get all users');
  console.log('  POST   /api/admin/user         - Create user');
  console.log('  PUT    /api/admin/user/:id     - Update user');
  console.log('  DELETE /api/admin/user/:id     - Delete user');
  console.log('  GET    /api/admin/reimburse    - Get all reimbursements');
  console.log('');
  console.log('  👤 User Endpoints (requires authentication):');
  console.log('  GET  /api/user/limit               - Get user limit');
  console.log('  POST /api/user/reimburse           - Create reimbursement');
  console.log('  GET  /api/user/reimburse/history   - Get reimbursement history');
  console.log('='.repeat(50));
});

module.exports = app;
