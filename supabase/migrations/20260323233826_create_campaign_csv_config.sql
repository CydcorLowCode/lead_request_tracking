
-- Campaign CSV Config: each row = one column in a campaign's CSV output
CREATE TABLE IF NOT EXISTS campaign_csv_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign TEXT NOT NULL,
  field_key TEXT NOT NULL,
  display_label TEXT NOT NULL,
  source_table TEXT NOT NULL DEFAULT 'orders',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  field_group TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign, field_key, source_table)
);

CREATE INDEX idx_csv_config_campaign ON campaign_csv_config(campaign, is_active, sort_order);
;
