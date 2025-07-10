const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/auth.middleware');
const reimburseController = require('../controllers/reimburse.controller');

// Middleware untuk semua rute user
router.use(checkAuth);

// ===== FITUR USER =====
/**
 * GET /api/user/limit
 * Mendapatkan informasi limit reimburse user
 */
router.get('/limit', reimburseController.getUserLimit);

/**
 * POST /api/user/reimburse
 * Membuat reimburse baru dengan upload file struk
 * Content-Type: multipart/form-data
 * Fields:
 * - harga_bbm (required): Harga BBM total dalam rupiah
 * - spedometer_sebelum (required): Angka spedometer sebelum
 * - spedometer_setelah (optional): Angka spedometer setelah
 * - jenis_bbm (required): Jenis BBM (Pertamax, Pertalite, Solar, dll)
 * - harga_per_liter (required): Harga per liter BBM dalam rupiah
 * - jumlah_liter_bbm (required): Jumlah liter BBM yang dibeli (decimal)
 * - struk_pembelian (required): File gambar struk pembelian
 */
router.post('/reimburse', reimburseController.createReimbursement);

/**
 * GET /api/user/reimburse/history
 * Mendapatkan history reimburse user
 * Query parameters:
 * - filter: today, yesterday, this_month
 */
router.get('/reimburse/history', reimburseController.getReimbursementHistory);

module.exports = router;
