
-- CSV Generation Log: audit trail for each CSV generation run
CREATE TABLE IF NOT EXISTS csv_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign TEXT NOT NULL,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lookback_days INT NOT NULL DEFAULT 3,
  order_count INT NOT NULL DEFAULT 0,
  storage_path TEXT,
  storage_url TEXT,
  email_sent_to TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_csv_log_campaign_date ON csv_generation_log(campaign, run_date);
;
