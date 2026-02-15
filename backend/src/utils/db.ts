/**
 * Database connection utility
 * Manages PostgreSQL connection pool with error handling
 */

import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool with timeout settings
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('supabase') || databaseUrl.includes('neon')
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 5000, // 5 second connection timeout
  idleTimeoutMillis: 30000, // 30 second idle timeout
  max: 20, // Maximum pool size
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  // Don't exit process, let the app handle connection errors gracefully
});

/**
 * Test database connection
 * Returns true if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Execute a query with automatic error handling
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<{ success: boolean; data?: T; error?: string }> {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return { success: true, data: result as T };
  } catch (error: any) {
    console.error('Query execution error:', error);
    
    // Check for specific database errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return { success: false, error: 'Database connection failed' };
    } else if (error.code === '23505') {
      return { success: false, error: 'Duplicate entry' };
    } else if (error.code === '23503') {
      return { success: false, error: 'Foreign key constraint violation' };
    }
    
    return { success: false, error: error.message || 'Database error' };
  } finally {
    if (client) {
      client.release();
    }
  }
}

export default pool;
