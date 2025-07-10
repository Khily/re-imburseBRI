// Test script untuk debugging API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: 'test@gmail.com',
  password: 'password123',
  pemilik_mobil: 'Test User',
  personal_number: 'TST001',
  plat_nomor: 'B9999TST'
};

const testReimburse = {
  harga_bbm: '75000',
  spedometer_sebelum: '12345',
  spedometer_setelah: '12445',
  jenis_bbm: 'Pertamax',
  harga_per_liter: '15000',
  jumlah_liter_bbm: '5.0'
};

// Test register endpoint
async function testRegister() {
  try {
    console.log('Testing Register endpoint...');
    console.log('Request Body:', JSON.stringify(testUser, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Register Success:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Register Error:', error.response?.data || error.message);
    return null;
  }
}

// Test login endpoint
async function testLogin() {
  try {
    console.log('\nTesting Login endpoint...');
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    console.log('Request Body:', JSON.stringify(loginData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login Success:', response.data);
    return response.data.data?.session?.access_token;
  } catch (error) {
    console.log('❌ Login Error:', error.response?.data || error.message);
    return null;
  }
}

// Test upload reimburse (tanpa file untuk debugging field validation)
async function testReimburseValidation(token) {
  try {
    console.log('\nTesting Reimburse field validation...');
    console.log('Request Body:', JSON.stringify(testReimburse, null, 2));
    
    // Test dengan FormData
    const FormData = require('form-data');
    const form = new FormData();
    
    Object.keys(testReimburse).forEach(key => {
      form.append(key, testReimburse[key]);
    });
    
    const response = await axios.post(`${BASE_URL}/api/user/reimburse`, form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    });
    
    console.log('✅ Reimburse Success:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Reimburse Error:', error.response?.data || error.message);
    
    // Analisis error untuk debugging
    if (error.response?.data?.message?.includes('field harus diisi')) {
      console.log('\n🔍 Field Validation Error Analysis:');
      console.log('Required fields: harga_bbm, spedometer_sebelum, jenis_bbm, harga_per_liter, jumlah_liter_bbm, struk_pembelian');
      console.log('Sent fields:', Object.keys(testReimburse));
      
      const requiredFields = ['harga_bbm', 'spedometer_sebelum', 'jenis_bbm', 'harga_per_liter', 'jumlah_liter_bbm'];
      const missingFields = requiredFields.filter(field => !testReimburse[field]);
      
      if (missingFields.length > 0) {
        console.log('Missing fields:', missingFields);
      } else {
        console.log('Missing: struk_pembelian (file) - expected for file upload');
      }
    }
    
    return null;
  }
}

// Test server health
async function testHealth() {
  try {
    console.log('Testing server health...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server Health:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server Health Error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test server health first
  const serverOk = await testHealth();
  if (!serverOk) {
    console.log('❌ Server tidak berjalan. Jalankan server terlebih dahulu dengan: npm run dev');
    return;
  }
  
  // Test register
  await testRegister();
  
  // Test login
  const token = await testLogin();
  
  if (token) {
    console.log('\n🔑 Token obtained:', token.substring(0, 50) + '...');
    
    // Test reimburse validation
    await testReimburseValidation(token);
  }
  
  console.log('\n✅ Test completed!');
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testRegister,
  testLogin,
  testReimburseValidation,
  testHealth
};
