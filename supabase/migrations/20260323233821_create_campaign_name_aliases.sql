
-- Campaign Name Aliases: maps variant campaign names to canonical snake_case
CREATE TABLE IF NOT EXISTS campaign_name_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_alias_canonical ON campaign_name_aliases(canonical_name);

INSERT INTO campaign_name_aliases (alias, canonical_name) VALUES
  ('Amazon Business', 'amazon_business'),
  ('HelloFresh Canada', 'hellofresh_canada'),
  ('Broker Online Exchange', 'box'),
  ('First Data', 'first_data'),
  ('Quill Omni', 'quill'),
  ('Ooma B2B Canada', 'ooma_b2b_canada'),
  ('Amazon Business Canada', 'amazon_business_canada')
ON CONFLICT (alias) DO NOTHING;
;
