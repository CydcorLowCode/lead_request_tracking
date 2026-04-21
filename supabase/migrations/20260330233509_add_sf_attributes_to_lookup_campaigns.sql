
ALTER TABLE lookup_campaigns
  ADD COLUMN IF NOT EXISTS campaign_unified_code TEXT,
  ADD COLUMN IF NOT EXISTS salesforce_id TEXT,
  ADD COLUMN IF NOT EXISTS campaign_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS campaign_type TEXT,
  ADD COLUMN IF NOT EXISTS campaign_status TEXT,
  ADD COLUMN IF NOT EXISTS campaign_industry TEXT,
  ADD COLUMN IF NOT EXISTS launch_date DATE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add unique constraint on salesforce_id for campaigns that have one
CREATE UNIQUE INDEX IF NOT EXISTS idx_lookup_campaigns_sf_id ON lookup_campaigns(salesforce_id) WHERE salesforce_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_lookup_campaigns_unified_code ON lookup_campaigns(campaign_unified_code) WHERE campaign_unified_code IS NOT NULL;
;
