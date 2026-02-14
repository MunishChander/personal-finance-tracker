-- Migration: Create assets table
-- Description: Creates the main assets table with support for Fixed Deposits and Savings Accounts

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('fixed-deposit', 'savings-account')),
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50),
  
  -- Fixed Deposit fields
  principal_amount DECIMAL(15, 2) CHECK (principal_amount > 0),
  interest_rate DECIMAL(5, 2) CHECK (interest_rate >= 0 AND interest_rate <= 100),
  start_date DATE,
  maturity_date DATE,
  
  -- Savings Account fields
  current_balance DECIMAL(15, 2) CHECK (current_balance >= 0),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_fd_dates CHECK (
    type != 'fixed-deposit' OR maturity_date > start_date
  ),
  CONSTRAINT fd_required_fields CHECK (
    type != 'fixed-deposit' OR (
      principal_amount IS NOT NULL AND
      interest_rate IS NOT NULL AND
      start_date IS NOT NULL AND
      maturity_date IS NOT NULL
    )
  ),
  CONSTRAINT savings_required_fields CHECK (
    type != 'savings-account' OR (
      account_number IS NOT NULL AND
      current_balance IS NOT NULL
    )
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_bank_name ON assets(bank_name);
CREATE INDEX IF NOT EXISTS idx_assets_maturity_date ON assets(maturity_date) WHERE type = 'fixed-deposit';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_assets_updated_at 
  BEFORE UPDATE ON assets
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE assets IS 'Stores financial assets including Fixed Deposits and Savings Accounts';
