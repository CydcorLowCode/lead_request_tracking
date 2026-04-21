
-- Maps campaign + country to a Salesforce Campaign ID (the "Unified Code")
-- This handles the hardcoded US/Canada branching for Amazon Business
CREATE TABLE IF NOT EXISTS campaign_unified_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',  -- matches icl.country_text
  sf_campaign_id TEXT NOT NULL,                    -- the numeric Salesforce Campaign ID
  UNIQUE(campaign, country)
);

-- Placeholder values - Travis to fill in the actual SF Campaign IDs
INSERT INTO campaign_unified_codes (campaign, country, sf_campaign_id) VALUES
  ('amazon_business', 'United States', 'PLACEHOLDER_US'),
  ('amazon_business', 'Canada', 'PLACEHOLDER_CA')
ON CONFLICT (campaign, country) DO NOTHING;
;
