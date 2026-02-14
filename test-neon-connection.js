// Test Neon Database Connection
const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function testNeonConnection() {
  console.log('🔌 Testing Neon Database Connection...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to Neon...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test 1: Get PostgreSQL version
    console.log('📊 Test 1: PostgreSQL Version');
    const versionResult = await client.query('SELECT version()');
    console.log('   Version:', versionResult.rows[0].version.split(' ').slice(0, 2).join(' '));
    console.log('   ✅ Version check passed\n');
    
    // Test 2: Get current database name
    console.log('📊 Test 2: Database Name');
    const dbResult = await client.query('SELECT current_database()');
    console.log('   Database:', dbResult.rows[0].current_database);
    console.log('   ✅ Database check passed\n');
    
    // Test 3: Get current user
    console.log('📊 Test 3: Current User');
    const userResult = await client.query('SELECT current_user');
    console.log('   User:', userResult.rows[0].current_user);
    console.log('   ✅ User check passed\n');
    
    // Test 4: Check if we can create tables (permissions)
    console.log('📊 Test 4: Permissions Check');
    await client.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Can create tables\n');
    
    // Test 5: Insert and read data
    console.log('📊 Test 5: Insert & Read Data');
    await client.query(`
      INSERT INTO connection_test (test_message) 
      VALUES ('Neon connection successful!')
    `);
    const dataResult = await client.query('SELECT * FROM connection_test ORDER BY id DESC LIMIT 1');
    console.log('   Message:', dataResult.rows[0].test_message);
    console.log('   ✅ Can insert and read data\n');
    
    // Clean up test table
    await client.query('DROP TABLE IF EXISTS connection_test');
    console.log('🧹 Cleaned up test table\n');
    
    await client.end();
    console.log('👋 Connection closed\n');
    
    console.log('═══════════════════════════════════════');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('✅ Your Neon database is ready to use!');
    console.log('✅ Connection string is correct');
    console.log('✅ Permissions are properly configured');
    console.log('✅ You can now start Phase 1 development');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in backend/.env');
    console.error('2. Ensure the connection string includes ?sslmode=require');
    console.error('3. Verify your internet connection');
    console.error('4. Check Neon status: https://neonstatus.com\n');
    process.exit(1);
  }
}

// Run the test
testNeonConnection();
