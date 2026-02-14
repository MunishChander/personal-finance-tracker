/**
 * Database Connection Test Script
 * Run with: node test-db-connection.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in backend/.env file');
    process.exit(1);
  }
  
  console.log('📝 Connection string:', databaseUrl.replace(/:[^:@]+@/, ':****@'));
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase') || databaseUrl.includes('neon') 
      ? { rejectUnauthorized: false } 
      : false
  });
  
  try {
    console.log('\n⏳ Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test query
    console.log('🔍 Running test query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    
    // Check if assets table exists
    console.log('\n🔍 Checking for assets table...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'assets'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Assets table exists');
      
      // Count assets
      const countResult = await client.query('SELECT COUNT(*) as count FROM assets');
      console.log(`📊 Assets in database: ${countResult.rows[0].count}`);
    } else {
      console.log('⚠️  Assets table does not exist yet');
      console.log('💡 Run migrations: cd database && npm run migrate');
    }
    
    console.log('\n✨ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Tip: Check your password in the DATABASE_URL');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Tip: Check your internet connection and database host');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 Tip: Create the database first or use a cloud provider');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
