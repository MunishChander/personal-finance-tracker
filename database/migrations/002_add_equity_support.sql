-- Migration: Add equity support
-- Description: Adds support for equity (stock) assets

-- Update type constraint to include 'equity'
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;
ALTER TABLE assets ADD CONSTRAINT assets_type_check 
  CHECK (type IN ('fixed-deposit', 'savings-account', 'equity'));

-- Add equity-specific fields
ALTER TABLE assets ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS exchange VARCHAR(10);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS quantity DECIMAL(15, 4);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS average_price DECIMAL(15, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS current_price DECIMAL(15, 2);

-- Add constraint for equity required fields
ALTER TABLE assets ADD CONSTRAINT equity_required_fields CHECK (
  type != 'equity' OR (
    symbol IS NOT NULL AND
    company_name IS NOT NULL AND
    exchange IS NOT NULL AND
    quantity IS NOT NULL AND
    quantity > 0 AND
    average_price IS NOT NULL AND
    average_price > 0
  )
);

-- Add constraint for valid exchange
ALTER TABLE assets ADD CONSTRAINT valid_exchange CHECK (
  type != 'equity' OR exchange IN ('NSE', 'BSE')
);

-- Create index for equity symbol lookups
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON assets(symbol) WHERE type = 'equity';

-- Update comment
COMMENT ON TABLE assets IS 'Stores financial assets including Fixed Deposits, Savings Accounts, and Equities';
