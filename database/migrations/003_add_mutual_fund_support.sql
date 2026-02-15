-- Migration: Add Mutual Fund Support
-- Description: Adds columns to support mutual fund assets

-- Add mutual fund specific columns
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS scheme_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS scheme_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS fund_house VARCHAR(200),
ADD COLUMN IF NOT EXISTS units DECIMAL(15, 4),
ADD COLUMN IF NOT EXISTS average_nav DECIMAL(15, 4),
ADD COLUMN IF NOT EXISTS current_nav DECIMAL(15, 4);

-- Add index for scheme_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_assets_scheme_code ON assets(scheme_code);

-- Add comment
COMMENT ON COLUMN assets.scheme_code IS 'AMFI scheme code for mutual funds';
COMMENT ON COLUMN assets.scheme_name IS 'Full name of the mutual fund scheme';
COMMENT ON COLUMN assets.fund_house IS 'Asset Management Company (AMC) name';
COMMENT ON COLUMN assets.units IS 'Number of mutual fund units held';
COMMENT ON COLUMN assets.average_nav IS 'Average purchase NAV per unit';
COMMENT ON COLUMN assets.current_nav IS 'Current NAV per unit (fetched from API)';
