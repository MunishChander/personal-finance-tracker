// Diagnose Neon Connection Issues
require('dotenv').config({ path: './backend/.env' });

console.log('🔍 Diagnosing Neon Connection...\n');

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in backend/.env');
  process.exit(1);
}

console.log('✅ DATABASE_URL found in .env file\n');

// Parse the connection string
const url = process.env.DATABASE_URL;
console.log('📋 Connection String Details:');
console.log('   Full URL:', url);
console.log('');

try {
  const urlObj = new URL(url);
  console.log('   Protocol:', urlObj.protocol);
  console.log('   Username:', urlObj.username);
  console.log('   Password:', urlObj.password ? '***' + urlObj.password.slice(-4) : 'MISSING');
  console.log('   Hostname:', urlObj.hostname);
  console.log('   Port:', urlObj.port || '5432 (default)');
  console.log('   Database:', urlObj.pathname.slice(1));
  console.log('   SSL Mode:', urlObj.searchParams.get('sslmode') || 'NOT SET');
  console.log('');
} catch (err) {
  console.error('❌ Invalid URL format:', err.message);
  process.exit(1);
}

// Try connection with detailed error
const { Client } = require('pg');

async function testConnection() {
  console.log('🔌 Attempting connection...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
    
    await client.end();
    console.log('\n🎉 Your Neon database is working perfectly!');
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED!\n');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('');
    
    // Provide specific troubleshooting
    if (error.message.includes('Tenant or user not found')) {
      console.log('🔍 Possible Causes:');
      console.log('   1. Neon project is suspended/paused');
      console.log('   2. Password or username is incorrect');
      console.log('   3. Project was deleted or recreated');
      console.log('   4. Region mismatch');
      console.log('');
      console.log('💡 Solutions:');
      console.log('   1. Go to https://console.neon.tech');
      console.log('   2. Check if your project is "Active"');
      console.log('   3. If suspended, click "Resume"');
      console.log('   4. If not found, get a NEW connection string');
      console.log('   5. Reset password if needed');
    } else if (error.message.includes('timeout')) {
      console.log('🔍 Connection timeout - check your internet connection');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🔍 Hostname not found - check the connection string');
    }
    
    process.exit(1);
  }
}

testConnection();
