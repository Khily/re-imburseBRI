const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Login user dengan email dan password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi.'
      });
    }

    // Login menggunakan Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    // Ambil data profile user
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
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        message: 'Profile user tidak ditemukan.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          ...userProfile
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat login.'
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal logout.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout berhasil.'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat logout.'
    });
  }
};

/**
 * Register user baru (untuk development/testing)
 */
const register = async (req, res) => {
  try {
    const { email, password, pemilik_mobil, personal_number, plat_nomor, role_id } = req.body;

    if (!email || !password || !pemilik_mobil || !personal_number || !plat_nomor) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi.'
      });
    }

    // Register user dengan Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Jika user berhasil dibuat, buat profile
    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from('user_profile')
        .insert([{
          id: data.user.id,
          pemilik_mobil,
          personal_number,
          plat_nomor,
          role_id: role_id || null,
          is_admin: false
        }]);

      if (profileError) {
        // Jika gagal membuat profile, hapus user yang sudah dibuat
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        
        return res.status(400).json({
          success: false,
          message: 'Gagal membuat profile user: ' + profileError.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'User berhasil didaftarkan.',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat registrasi.'
    });
  }
};

module.exports = {
  login,
  logout,
  register
};
