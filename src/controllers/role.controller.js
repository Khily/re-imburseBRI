const { supabaseAdmin } = require('../config/supabase');

/**
 * Mendapatkan semua role
 */
const getAllRoles = async (req, res) => {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from('role')
      .select('*')
      .order('nama_role', { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal mengambil data role: ' + error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Data role berhasil diambil.',
      data: roles
    });

  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil data role.'
    });
  }
};

/**
 * Membuat role baru
 */
const createRole = async (req, res) => {
  try {
    const { nama_role, limit_role } = req.body;

    if (!nama_role || !limit_role) {
      return res.status(400).json({
        success: false,
        message: 'Nama role dan limit role harus diisi.'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('role')
      .insert([{
        nama_role,
        limit_role: parseInt(limit_role)
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal membuat role: ' + error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Role berhasil dibuat.',
      data: data
    });

  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat membuat role.'
    });
  }
};

/**
 * Update role berdasarkan ID
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_role, limit_role } = req.body;

    if (!nama_role || !limit_role) {
      return res.status(400).json({
        success: false,
        message: 'Nama role dan limit role harus diisi.'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('role')
      .update({
        nama_role,
        limit_role: parseInt(limit_role)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal update role: ' + error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Role tidak ditemukan.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Role berhasil diupdate.',
      data: data
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat update role.'
    });
  }
};

/**
 * Hapus role berdasarkan ID
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah role sedang digunakan oleh user
    const { data: usedRole, error: checkError } = await supabaseAdmin
      .from('user_profile')
      .select('id')
      .eq('role_id', id)
      .limit(1);

    if (checkError) {
      return res.status(400).json({
        success: false,
        message: 'Gagal memeriksa penggunaan role: ' + checkError.message
      });
    }

    if (usedRole && usedRole.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak dapat dihapus karena masih digunakan oleh user.'
      });
    }

    const { error } = await supabaseAdmin
      .from('role')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal menghapus role: ' + error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Role berhasil dihapus.'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat menghapus role.'
    });
  }
};

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole
};
