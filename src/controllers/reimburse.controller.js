const { supabaseAdmin } = require('../config/supabase');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPEG, PNG) yang diperbolehkan'), false);
    }
  }
});

/**
 * Middleware multer untuk upload file
 */
const uploadMiddleware = upload.single('struk_pembelian');

/**
 * Helper function untuk menentukan filter tanggal
 */
const getDateFilter = (filter) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      };
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday.toISOString(),
        end: today.toISOString()
      };
    case 'this_month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      };
    default:
      return null;
  }
};

/**
 * [ADMIN] Mendapatkan semua data reimburse dengan detail user
 */
const getAllReimbursementsForAdmin = async (req, res) => {
  try {
    const { filter } = req.query;
    
    let query = supabaseAdmin
      .from('reimburse')
      .select(`
        *,
        user_profile:user_id (
          pemilik_mobil,
          personal_number,
          plat_nomor,
          role:role_id (
            nama_role,
            limit_role
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Terapkan filter tanggal jika ada
    const dateFilter = getDateFilter(filter);
    if (dateFilter) {
      query = query
        .gte('created_at', dateFilter.start)
        .lt('created_at', dateFilter.end);
    }

    const { data: reimbursements, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal mengambil data reimburse: ' + error.message
      });
    }

    // Format data untuk response
    const formattedData = reimbursements.map(item => ({
      id: item.id,
      harga_bbm: item.harga_bbm,
      spedometer_sebelum: item.spedometer_sebelum,
      spedometer_setelah: item.spedometer_setelah,
      selisih_km: item.spedometer_setelah ? item.spedometer_setelah - item.spedometer_sebelum : null,
      jenis_bbm: item.jenis_bbm,
      harga_per_liter: item.harga_per_liter,
      jumlah_liter_bbm: item.jumlah_liter_bbm,
      struk_pembelian: item.struk_pembelian, // URL publik ke file bukti
      created_at: item.created_at,
      user: {
        id: item.user_id,
        pemilik_mobil: item.user_profile?.pemilik_mobil,
        personal_number: item.user_profile?.personal_number,
        plat_nomor: item.user_profile?.plat_nomor,
        role: item.user_profile?.role
      }
    }));

    res.status(200).json({
      success: true,
      message: `Data reimburse berhasil diambil${filter ? ` (filter: ${filter})` : ''}.`,
      data: formattedData,
      total: formattedData.length
    });

  } catch (error) {
    console.error('Get all reimbursements error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil data reimburse.'
    });
  }
};

/**
 * [USER] Mendapatkan limit reimburse user
 */
const getUserLimit = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil data user dengan role
    const { data: userProfile, error } = await supabaseAdmin
      .from('user_profile')
      .select(`
        *,
        role:role_id (
          id,
          nama_role,
          limit_role
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Data user tidak ditemukan.'
      });
    }

    // Hitung total reimburse bulan ini
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const { data: monthlyReimburse, error: reimburseError } = await supabaseAdmin
      .from('reimburse')
      .select('harga_bbm')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lt('created_at', endOfMonth.toISOString());

    if (reimburseError) {
      return res.status(400).json({
        success: false,
        message: 'Gagal menghitung total reimburse: ' + reimburseError.message
      });
    }

    const totalThisMonth = monthlyReimburse.reduce((sum, item) => sum + item.harga_bbm, 0);
    const limitRole = userProfile.role?.limit_role || 0;
    const remainingLimit = Math.max(0, limitRole - totalThisMonth);

    res.status(200).json({
      success: true,
      message: 'Data limit berhasil diambil.',
      data: {
        user: {
          pemilik_mobil: userProfile.pemilik_mobil,
          personal_number: userProfile.personal_number,
          plat_nomor: userProfile.plat_nomor
        },
        role: userProfile.role,
        limit: {
          total_limit: limitRole,
          used_this_month: totalThisMonth,
          remaining_limit: remainingLimit,
          month: now.getMonth() + 1,
          year: now.getFullYear()
        }
      }
    });

  } catch (error) {
    console.error('Get user limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil data limit.'
    });
  }
};

/**
 * [USER] Membuat reimburse baru dengan upload file
 */
const createReimbursement = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'Error upload file: ' + err.message
      });
    }

    try {
      const userId = req.user.id;
      const { harga_bbm, spedometer_sebelum, spedometer_setelah, jenis_bbm, harga_per_liter, jumlah_liter_bbm } = req.body;

      if (!harga_bbm || !spedometer_sebelum || !req.file || !jenis_bbm || !harga_per_liter || !jumlah_liter_bbm) {
        return res.status(400).json({
          success: false,
          message: 'Semua field harus diisi: harga_bbm, spedometer_sebelum, jenis_bbm, harga_per_liter, jumlah_liter_bbm, dan struk_pembelian.'
        });
      }

      // Validasi tipe data numerik
      const hargaBbmNum = parseInt(harga_bbm);
      const spedoSebelumNum = parseInt(spedometer_sebelum);
      const spedoSetelahNum = spedometer_setelah ? parseInt(spedometer_setelah) : null;
      const hargaPerLiterNum = parseInt(harga_per_liter);
      const jumlahLiterNum = parseFloat(jumlah_liter_bbm);

      if (isNaN(hargaBbmNum) || isNaN(spedoSebelumNum) || isNaN(hargaPerLiterNum) || isNaN(jumlahLiterNum)) {
        return res.status(400).json({
          success: false,
          message: 'Format angka tidak valid untuk harga_bbm, spedometer, harga_per_liter, atau jumlah_liter_bbm.'
        });
      }

      // Validasi konsistensi perhitungan
      const expectedHarga = Math.round(hargaPerLiterNum * jumlahLiterNum);
      if (Math.abs(expectedHarga - hargaBbmNum) > 100) { // Toleransi 100 rupiah untuk pembulatan
        return res.status(400).json({
          success: false,
          message: `Harga BBM (${hargaBbmNum}) tidak sesuai dengan perhitungan: ${hargaPerLiterNum} x ${jumlahLiterNum} = ${expectedHarga}`
        });
      }

      // Validasi spedometer
      if (spedoSetelahNum && spedoSetelahNum <= spedoSebelumNum) {
        return res.status(400).json({
          success: false,
          message: 'Spedometer setelah harus lebih besar dari spedometer sebelum.'
        });
      }

      // Cek limit user
      const { data: userProfile, error: userError } = await supabaseAdmin
        .from('user_profile')
        .select(`
          role:role_id (
            limit_role
          )
        `)
        .eq('id', userId)
        .single();

      if (userError || !userProfile) {
        return res.status(404).json({
          success: false,
          message: 'Data user tidak ditemukan.'
        });
      }

      // Hitung total reimburse bulan ini
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const { data: monthlyReimburse, error: reimburseError } = await supabaseAdmin
        .from('reimburse')
        .select('harga_bbm')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', endOfMonth.toISOString());

      if (reimburseError) {
        return res.status(400).json({
          success: false,
          message: 'Gagal memeriksa limit: ' + reimburseError.message
        });
      }

      const totalThisMonth = monthlyReimburse.reduce((sum, item) => sum + item.harga_bbm, 0);
      const limitRole = userProfile.role?.limit_role || 0;
      const newTotal = totalThisMonth + hargaBbmNum;

      if (newTotal > limitRole) {
        return res.status(400).json({
          success: false,
          message: `Reimburse melebihi limit. Limit: ${limitRole}, Sudah digunakan: ${totalThisMonth}, Sisa limit: ${limitRole - totalThisMonth}`
        });
      }

      // Upload file ke Supabase Storage
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(process.env.STORAGE_BUCKET || 'struk-pembelian')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        return res.status(400).json({
          success: false,
          message: 'Gagal upload file: ' + uploadError.message
        });
      }

      // Dapatkan URL publik
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(process.env.STORAGE_BUCKET || 'struk-pembelian')
        .getPublicUrl(fileName);

      // Simpan data reimburse
      const { data: reimburseData, error: saveError } = await supabaseAdmin
        .from('reimburse')
        .insert([{
          user_id: userId,
          harga_bbm: hargaBbmNum,
          spedometer_sebelum: spedoSebelumNum,
          spedometer_setelah: spedoSetelahNum,
          jenis_bbm: jenis_bbm,
          harga_per_liter: hargaPerLiterNum,
          jumlah_liter_bbm: jumlahLiterNum,
          struk_pembelian: publicUrl
        }])
        .select()
        .single();

      if (saveError) {
        // Hapus file yang sudah diupload jika gagal simpan data
        await supabaseAdmin.storage
          .from(process.env.STORAGE_BUCKET || 'struk-pembelian')
          .remove([fileName]);

        return res.status(400).json({
          success: false,
          message: 'Gagal menyimpan data reimburse: ' + saveError.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Reimburse berhasil dibuat.',
        data: {
          ...reimburseData,
          selisih_km: reimburseData.spedometer_setelah ? reimburseData.spedometer_setelah - reimburseData.spedometer_sebelum : null,
          total_harga_calculated: reimburseData.harga_per_liter * reimburseData.jumlah_liter_bbm
        }
      });

    } catch (error) {
      console.error('Create reimbursement error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server saat membuat reimburse.'
      });
    }
  });
};

/**
 * [USER] Mendapatkan history reimburse user
 */
const getReimbursementHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query;

    let query = supabaseAdmin
      .from('reimburse')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Terapkan filter tanggal jika ada
    const dateFilter = getDateFilter(filter);
    if (dateFilter) {
      query = query
        .gte('created_at', dateFilter.start)
        .lt('created_at', dateFilter.end);
    }

    const { data: reimbursements, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Gagal mengambil history reimburse: ' + error.message
      });
    }

    // Format data untuk response
    const formattedData = reimbursements.map(item => ({
      id: item.id,
      harga_bbm: item.harga_bbm,
      spedometer_sebelum: item.spedometer_sebelum,
      spedometer_setelah: item.spedometer_setelah,
      selisih_km: item.spedometer_setelah ? item.spedometer_setelah - item.spedometer_sebelum : null,
      jenis_bbm: item.jenis_bbm,
      harga_per_liter: item.harga_per_liter,
      jumlah_liter_bbm: item.jumlah_liter_bbm,
      struk_pembelian: item.struk_pembelian,
      created_at: item.created_at
    }));

    // Hitung total
    const total = formattedData.reduce((sum, item) => sum + item.harga_bbm, 0);

    res.status(200).json({
      success: true,
      message: `History reimburse berhasil diambil${filter ? ` (filter: ${filter})` : ''}.`,
      data: formattedData,
      summary: {
        total_records: formattedData.length,
        total_amount: total
      }
    });

  } catch (error) {
    console.error('Get reimbursement history error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil history reimburse.'
    });
  }
};

module.exports = {
  getAllReimbursementsForAdmin,
  getUserLimit,
  createReimbursement,
  getReimbursementHistory
};
