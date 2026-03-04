-- Migration: Add Provident Fund (EPF/PF) Support
-- Description: Adds columns to support EPF/PF tracking with monthly contributions and projections

-- Add new columns for Provident Fund
ALTER TABLE assets ADD COLUMN IF NOT EXISTS uan VARCHAR(12);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS current_balance DECIMAL(15, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS monthly_contribution_employee DECIMAL(10, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS monthly_contribution_employer DECIMAL(10, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_updated_date TIMESTAMP;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS projected_balance DECIMAL(15, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS projected_annual_growth DECIMAL(15, 2);

-- Add check constraint for valid asset types
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;
ALTER TABLE assets ADD CONSTRAINT assets_type_check 
  CHECK (type IN ('fixed-deposit', 'savings-account', 'equity', 'mutual-fund', 'provident-fund'));

-- Create index on UAN for faster lookups
CREATE INDEX IF NOT EXISTS idx_assets_uan ON assets(uan) WHERE uan IS NOT NULL;

-- Add comments
COMMENT ON COLUMN assets.uan IS 'Universal Account Number for EPF';
COMMENT ON COLUMN assets.current_balance IS 'Current PF balance';
COMMENT ON COLUMN assets.monthly_contribution_employee IS 'Employee monthly contribution';
COMMENT ON COLUMN assets.monthly_contribution_employer IS 'Employer monthly contribution';
COMMENT ON COLUMN assets.last_updated_date IS 'Date when balance was last updated';
COMMENT ON COLUMN assets.projected_balance IS 'Projected balance based on contributions and interest';
COMMENT ON COLUMN assets.projected_annual_growth IS 'Projected annual growth amount';
