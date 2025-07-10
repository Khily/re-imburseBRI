const express = require('express');
const router = express.Router();
const { checkAuth, checkAdmin } = require('../middlewares/auth.middleware');
const roleController = require('../controllers/role.controller');
const userController = require('../controllers/user.controller');
const reimburseController = require('../controllers/reimburse.controller');

// Middleware untuk semua rute admin
router.use(checkAuth);
router.use(checkAdmin);

// ===== KELOLA ROLE =====
/**
 * GET /api/admin/role
 * Mendapatkan semua role
 */
router.get('/role', roleController.getAllRoles);

/**
 * POST /api/admin/role
 * Membuat role baru
 */
router.post('/role', roleController.createRole);

/**
 * PUT /api/admin/role/:id
 * Update role berdasarkan ID
 */
router.put('/role/:id', roleController.updateRole);

/**
 * DELETE /api/admin/role/:id
 * Hapus role berdasarkan ID
 */
router.delete('/role/:id', roleController.deleteRole);

// ===== KELOLA USER =====
/**
 * GET /api/admin/user
 * Mendapatkan semua user
 */
router.get('/user', userController.getAllUsers);

/**
 * POST /api/admin/user
 * Membuat user baru
 */
router.post('/user', userController.createUser);

/**
 * PUT /api/admin/user/:id
 * Update user berdasarkan ID
 */
router.put('/user/:id', userController.updateUser);

/**
 * DELETE /api/admin/user/:id
 * Hapus user berdasarkan ID
 */
router.delete('/user/:id', userController.deleteUser);

// ===== LIHAT DATA REIMBURSE =====
/**
 * GET /api/admin/reimburse
 * Mendapatkan semua data reimburse dengan detail user
 * Query parameters:
 * - filter: today, yesterday, this_month
 */
router.get('/reimburse', reimburseController.getAllReimbursementsForAdmin);

module.exports = router;
