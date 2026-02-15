import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    const migrationFile = process.argv[2];
    
    if (!migrationFile) {
      console.error('Usage: node run-migration.js <migration-file>');
      process.exit(1);
    }
    
    console.log(`Running migration: ${migrationFile}`);
    
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
