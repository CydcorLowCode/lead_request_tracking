-- Expand AT&T campaign lead types: 6 owner-facing + 6 territory-team-only.
-- Widens hardcoded lead_type CHECK constraints on lrt_sla_configs and
-- lrt_lead_requests to accept the 6 new slugs.
-- IMPORTANT: already applied to production — do NOT run `supabase db push`.

ALTER TABLE lrt_sla_configs
  DROP CONSTRAINT lrt_sla_configs_lead_type_check;

ALTER TABLE lrt_sla_configs
  ADD CONSTRAINT lrt_sla_configs_lead_type_check
  CHECK (lead_type = ANY (ARRAY[
    'permanent_assignment','business_trip','nlt_new_fiber','market_proposal',
    'oof_wireless','pullback',
    'oof_aia_wireless','qa_pullback_permit','mdu_acc','office_closure',
    'natural_disaster','no_solicitation'
  ]::text[]));

ALTER TABLE lrt_lead_requests
  DROP CONSTRAINT lrt_lead_requests_lead_type_check;

ALTER TABLE lrt_lead_requests
  ADD CONSTRAINT lrt_lead_requests_lead_type_check
  CHECK (lead_type = ANY (ARRAY[
    'permanent_assignment','business_trip','nlt_new_fiber','market_proposal',
    'oof_wireless','pullback',
    'oof_aia_wireless','qa_pullback_permit','mdu_acc','office_closure',
    'natural_disaster','no_solicitation'
  ]::text[]));

UPDATE lrt_campaigns
SET config = jsonb_set(
  config,
  '{lead_types}',
  '[
    {"value":"permanent_assignment","label":"Permanent Assignment","sla_hours":240},
    {"value":"business_trip","label":"Business Trip","sla_hours":240},
    {"value":"nlt_new_fiber","label":"NLT New Fiber","sla_hours":48},
    {"value":"market_proposal","label":"Market Proposal","sla_hours":72},
    {"value":"oof_wireless","label":"OOF/Wireless","sla_hours":240},
    {"value":"pullback","label":"Pullback/No Longer Needed","sla_hours":240},
    {"value":"oof_aia_wireless","label":"OOF - AIA/Wireless","sla_hours":240,"territory_team_only":true},
    {"value":"qa_pullback_permit","label":"QA Pullback - Not Meeting Permit Req","sla_hours":240,"territory_team_only":true},
    {"value":"mdu_acc","label":"MDU/ACC Program","sla_hours":240,"territory_team_only":true},
    {"value":"office_closure","label":"Office Closure","sla_hours":240,"territory_team_only":true},
    {"value":"natural_disaster","label":"Natural Disaster","sla_hours":240,"territory_team_only":true},
    {"value":"no_solicitation","label":"No Solicitation / Local Violation","sla_hours":240,"territory_team_only":true}
  ]'::jsonb
)
WHERE id = '9b456b23-bb25-4906-813f-7fc98d9d098c';

INSERT INTO lrt_sla_configs (campaign_id, lead_type, sla_hours, warning_hours)
VALUES
  ('9b456b23-bb25-4906-813f-7fc98d9d098c','oof_aia_wireless',240,216),
  ('9b456b23-bb25-4906-813f-7fc98d9d098c','qa_pullback_permit',240,216),
  ('9b456b23-bb25-4906-813f-7fc98d9d098c','mdu_acc',240,216),
  ('9b456b23-bb25-4906-813f-7fc98d9d098c','office_closure',240,216),
  ('9b456b23-bb25-4906-813f-7fc98d9d098c','natural_disaster',240,216),
  ('9b456b23-bb25-4906-813f-7fc98d9d098c','no_solicitation',240,216)
ON CONFLICT DO NOTHING;
