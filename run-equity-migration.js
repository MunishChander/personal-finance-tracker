import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('Running equity migration...');
    
    const sql = readFileSync('./database/migrations/002_add_equity_support.sql', 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
