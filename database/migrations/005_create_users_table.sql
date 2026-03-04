-- Migration: Create users table for Google OAuth authentication
-- This table stores user profile information synced from Supabase Auth

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user profile information synced from Supabase Auth during Google OAuth authentication';
COMMENT ON COLUMN users.supabase_id IS 'Unique identifier from Supabase Auth';
COMMENT ON COLUMN users.email IS 'User email address from Google OAuth';
COMMENT ON COLUMN users.full_name IS 'User full name from Google profile';
COMMENT ON COLUMN users.avatar_url IS 'URL to user avatar image from Google profile';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
