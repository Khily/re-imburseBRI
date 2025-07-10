const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Middleware untuk memverifikasi JWT token dari header Authorization
 * Jika valid, lampirkan data user ke req.user
 */
const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token dengan Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau telah expired.'
      });
    }

    // Ambil data profile user dari database
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profile')
      .select(`
        *,
        role:role_id (
          id,
          nama_role,
          limit_role
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(401).json({
        success: false,
        message: 'Profile user tidak ditemukan.'
      });
    }

    // Lampirkan data user ke request
    req.user = {
      id: user.id,
      email: user.email,
      ...userProfile
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi token.'
    });
  }
};

/**
 * Middleware untuk memeriksa apakah user adalah admin
 * Harus dijalankan setelah checkAuth
 */
const checkAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi.'
      });
    }

    if (!req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi hak akses admin.'
    });
  }
};

module.exports = {
  checkAuth,
  checkAdmin
};
