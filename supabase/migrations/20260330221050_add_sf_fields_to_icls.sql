
ALTER TABLE icls 
  ADD COLUMN IF NOT EXISTS sf_account_id_text TEXT,
  ADD COLUMN IF NOT EXISTS country_text TEXT,
  ADD COLUMN IF NOT EXISTS queueuserid__salesforce__text TEXT;
;
