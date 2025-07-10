const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * POST /api/auth/login
 * Login user dengan email dan password
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authController.logout);

/**
 * POST /api/auth/register
 * Register user baru (untuk development/testing)
 */
router.post('/register', authController.register);

module.exports = router;
