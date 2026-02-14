/**
 * Database connection utility
 * Manages PostgreSQL connection pool
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('supabase') || databaseUrl.includes('neon')
    ? { rejectUnauthorized: false }
    : false,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;
