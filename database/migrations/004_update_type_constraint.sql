-- Migration: Update Type Constraint
-- Description: Updates the type constraint to include equity and mutual-fund

-- Drop the old constraint
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;

-- Add the new constraint with all asset types
ALTER TABLE assets ADD CONSTRAINT assets_type_check 
  CHECK (type IN ('fixed-deposit', 'savings-account', 'equity', 'mutual-fund'));

-- Add comment
COMMENT ON CONSTRAINT assets_type_check ON assets IS 'Ensures asset type is one of: fixed-deposit, savings-account, equity, mutual-fund';
