const { supabaseAdmin } = require('./src/config/supabase');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Koneksi dasar
    console.log('1. Testing basic connection...');
    const { data, error } = await supabaseAdmin
      .from('role')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test 2: Cek tabel role
    console.log('\n2. Testing role table...');
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('role')
      .select('*');
    
    if (roleError) {
      console.error('❌ Role table error:', roleError.message);
      if (roleError.message.includes('does not exist')) {
        console.log('💡 Table "role" belum dibuat. Silakan jalankan SQL di database-setup.md');
      }
      return;
    }
    
    console.log(`✅ Role table found with ${roles.length} records`);
    roles.forEach(role => {
      console.log(`   - ${role.nama_role}: Rp ${role.limit_role.toLocaleString()}`);
    });
    
    // Test 3: Cek tabel user_profile
    console.log('\n3. Testing user_profile table...');
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profile')
      .select('*');
    
    if (profileError) {
      console.error('❌ User_profile table error:', profileError.message);
      if (profileError.message.includes('does not exist')) {
        console.log('💡 Table "user_profile" belum dibuat. Silakan jalankan SQL di database-setup.md');
      }
      return;
    }
    
    console.log(`✅ User_profile table found with ${profiles.length} records`);
    
    // Test 4: Cek tabel reimburse
    console.log('\n4. Testing reimburse table...');
    const { data: reimburses, error: reimburseError } = await supabaseAdmin
      .from('reimburse')
      .select('*');
    
    if (reimburseError) {
      console.error('❌ Reimburse table error:', reimburseError.message);
      if (reimburseError.message.includes('does not exist')) {
        console.log('💡 Table "reimburse" belum dibuat. Silakan jalankan SQL di database-setup.md');
      }
      return;
    }
    
    console.log(`✅ Reimburse table found with ${reimburses.length} records`);
    
    // Test 5: Cek storage bucket
    console.log('\n5. Testing storage bucket...');
    const { data: buckets, error: bucketError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('❌ Storage bucket error:', bucketError.message);
      return;
    }
    
    const strukBucket = buckets.find(bucket => bucket.name === 'struk-pembelian');
    if (strukBucket) {
      console.log('✅ Storage bucket "struk-pembelian" found');
    } else {
      console.log('⚠️  Storage bucket "struk-pembelian" not found');
      console.log('💡 Silakan buat bucket di Supabase Dashboard → Storage');
    }
    
    console.log('\n🎉 Database connection test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Jika ada tabel yang belum dibuat, jalankan SQL di database-setup.md');
    console.log('2. Jika storage bucket belum ada, buat di Supabase Dashboard');
    console.log('3. Test API endpoints dengan register/login user');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('- Pastikan file .env sudah benar');
    console.log('- Pastikan Supabase project masih aktif');
    console.log('- Cek koneksi internet');
  }
}

testDatabaseConnection();
