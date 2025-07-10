// Script untuk konfirmasi email user secara manual
const { supabaseAdmin } = require('./src/config/supabase');

async function confirmAllUsers() {
  try {
    console.log('🔍 Mengambil semua user yang belum dikonfirmasi...');
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Error getting users:', authError);
      return;
    }
    
    const unconfirmedUsers = authUsers.users.filter(user => !user.email_confirmed_at);
    
    if (unconfirmedUsers.length === 0) {
      console.log('✅ Semua user sudah dikonfirmasi');
      return;
    }
    
    console.log(`📧 Found ${unconfirmedUsers.length} user(s) yang belum dikonfirmasi:`);
    
    for (const user of unconfirmedUsers) {
      console.log(`\n🔧 Konfirmasi email untuk: ${user.email}`);
      
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      
      if (error) {
        console.error(`❌ Error confirming ${user.email}:`, error.message);
      } else {
        console.log(`✅ Email ${user.email} berhasil dikonfirmasi`);
      }
    }
    
    console.log('\n🎉 Proses konfirmasi selesai!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function listUsers() {
  try {
    console.log('📋 Daftar semua user:');
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Error getting users:', authError);
      return;
    }
    
    authUsers.users.forEach((user, index) => {
      const confirmed = user.email_confirmed_at ? '✅' : '❌';
      console.log(`${index + 1}. ${confirmed} ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Jika dipanggil langsung
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    listUsers();
  } else if (args.includes('--confirm')) {
    confirmAllUsers();
  } else {
    console.log('📖 Email Confirmation Helper\n');
    console.log('Usage:');
    console.log('  node email-confirm.js --list     # Lihat daftar user');
    console.log('  node email-confirm.js --confirm  # Konfirmasi semua user');
    console.log('\nNote: Script ini untuk development only!');
  }
}

module.exports = {
  confirmAllUsers,
  listUsers
};
