const fs = require('fs');
const path = require('path');

console.log('🔧 Checking development environment...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('📁 Please copy .env.example to .env and configure your Supabase settings:\n');
  console.log('cp .env.example .env\n');
  console.log('Then edit .env with your actual Supabase configuration.');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.log('\n📝 Please check your .env file and add the missing variables.');
  process.exit(1);
}

// Validate environment variables
const errors = [];

// Validate URL format
try {
  new URL(process.env.SUPABASE_URL);
} catch {
  errors.push('SUPABASE_URL is not a valid URL');
}

// Validate JWT secret length
if (process.env.JWT_SECRET.length < 32) {
  errors.push('JWT_SECRET should be at least 32 characters long for security');
}

if (errors.length > 0) {
  console.error('❌ Environment variable validation errors:');
  errors.forEach(error => console.error(`   - ${error}`));
  process.exit(1);
}

console.log('✅ Environment configuration is valid!');
console.log(`📡 Supabase URL: ${process.env.SUPABASE_URL}`);
console.log(`🗄️  Storage Bucket: ${process.env.STORAGE_BUCKET || 'struk-pembelian'}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚪 Port: ${process.env.PORT || 3000}\n`);

// Start the server
console.log('🚀 Starting server...\n');
require('./server');
