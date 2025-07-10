const { supabaseAdmin } = require('../config/supabase');

/**
 * Mendapatkan semua user dengan data role
 */
const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('user_profile')
      .select(`
        *,
        role:role_id (
          id,
          nama_role,
          limit_role
        )
      `)
      .order('pemilik_mobil', { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal mengambil data user: ' + error.message
      });
    }

    // Ambil data email dari auth.users untuk setiap user
    const usersWithEmail = await Promise.all(
      users.map(async (user) => {
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
          return {
            ...user,
            email: authUser?.user?.email || null
          };
        } catch (error) {
          console.error(`Error getting email for user ${user.id}:`, error);
          return {
            ...user,
            email: null
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      message: 'Data user berhasil diambil.',
      data: usersWithEmail
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil data user.'
    });
  }
};

/**
 * Membuat user baru
 */
const createUser = async (req, res) => {
  try {
    const { email, password, pemilik_mobil, personal_number, plat_nomor, role_id, is_admin } = req.body;

    if (!email || !password || !pemilik_mobil || !personal_number || !plat_nomor) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, pemilik mobil, personal number, dan plat nomor harus diisi.'
      });
    }

    // Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto confirm email
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: 'Gagal membuat user: ' + authError.message
      });
    }

    // Buat profile user
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profile')
      .insert([{
        id: authData.user.id,
        pemilik_mobil,
        personal_number,
        plat_nomor,
        role_id: role_id || null,
        is_admin: is_admin || false
      }])
      .select(`
        *,
        role:role_id (
          id,
          nama_role,
          limit_role
        )
      `)
      .single();

    if (profileError) {
      // Jika gagal membuat profile, hapus user yang sudah dibuat
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return res.status(400).json({
        success: false,
        message: 'Gagal membuat profile user: ' + profileError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat.',
      data: {
        ...profileData,
        email: authData.user.email
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat membuat user.'
    });
  }
};

/**
 * Update user berdasarkan ID
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, pemilik_mobil, personal_number, plat_nomor, role_id, is_admin } = req.body;

    // Update email di Supabase Auth jika ada
    if (email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email
      });

      if (authError) {
        return res.status(400).json({
          success: false,
          message: 'Gagal update email: ' + authError.message
        });
      }
    }

    // Update profile user
    const updateData = {};
    if (pemilik_mobil) updateData.pemilik_mobil = pemilik_mobil;
    if (personal_number) updateData.personal_number = personal_number;
    if (plat_nomor) updateData.plat_nomor = plat_nomor;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (is_admin !== undefined) updateData.is_admin = is_admin;

    const { data, error } = await supabaseAdmin
      .from('user_profile')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        role:role_id (
          id,
          nama_role,
          limit_role
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal update user: ' + error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    // Ambil email terbaru
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id);

    res.status(200).json({
      success: true,
      message: 'User berhasil diupdate.',
      data: {
        ...data,
        email: authUser?.user?.email || null
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat update user.'
    });
  }
};

/**
 * Hapus user berdasarkan ID
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah user memiliki data reimburse
    const { data: reimburseData, error: checkError } = await supabaseAdmin
      .from('reimburse')
      .select('id')
      .eq('user_id', id)
      .limit(1);

    if (checkError) {
      return res.status(400).json({
        success: false,
        message: 'Gagal memeriksa data reimburse: ' + checkError.message
      });
    }

    if (reimburseData && reimburseData.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User tidak dapat dihapus karena memiliki data reimburse.'
      });
    }

    // Hapus user dari Supabase Auth (profile akan terhapus otomatis karena CASCADE)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      return res.status(400).json({
        success: false,
        message: 'Gagal menghapus user: ' + authError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'User berhasil dihapus.'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat menghapus user.'
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
