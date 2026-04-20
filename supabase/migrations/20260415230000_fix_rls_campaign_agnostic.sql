-- ============================================================
-- Fix: Campaign-agnostic RLS policies for LRT tables
--
-- Root cause: owner access was gated on lrt_user_campaigns
-- membership, which may not exist when territory team submits
-- on behalf of an owner before the SF sync runs.
--
-- Design principles:
--   owners     → access based on owner_id / profile role only
--   territory_team → full access to all lrt_ data
--   lrt_user_campaigns → reserved for future multi-campaign UX
--                        (e.g. campaign picker when >1 active)
--
-- Campaign-agnostic: adding Rogers or any new campaign to
-- lrt_campaigns is all that's needed — no RLS changes required.
-- ============================================================


-- ----------------------------------------------------------------
-- 1. lrt_lead_requests — fix INSERT owner policy
--    Bug: original had `uc.campaign_id = uc.campaign_id`
--    (self-join, always true) AND required lrt_user_campaigns
--    membership which may not exist yet for new owners
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS lrt_lead_requests_insert_owner ON lrt_lead_requests;

CREATE POLICY lrt_lead_requests_insert_owner ON lrt_lead_requests
  FOR INSERT WITH CHECK (
    submitted_on_behalf = false
    AND EXISTS (
      SELECT 1 FROM lrt_profiles p
      WHERE p.id     = lrt_lead_requests.owner_id
        AND p.auth_user_id = auth.uid()
        AND COALESCE(p.is_active, true)
    )
    AND EXISTS (
      SELECT 1 FROM lrt_campaigns c
      WHERE c.id       = lrt_lead_requests.campaign_id
        AND c.is_active = true
    )
  );


-- ----------------------------------------------------------------
-- 2. lrt_campaigns — owners can see ALL active campaigns
--    (not only ones they appear in lrt_user_campaigns for)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS lrt_campaigns_select_member ON lrt_campaigns;

CREATE POLICY lrt_campaigns_select_member ON lrt_campaigns
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM lrt_profiles p
      WHERE p.auth_user_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------
-- 3. lrt_dmas — role-based access instead of user_campaigns join
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS lrt_dmas_select_member  ON lrt_dmas;
DROP POLICY IF EXISTS lrt_dmas_select_owner   ON lrt_dmas;   -- idempotent safety

CREATE POLICY lrt_dmas_select_owner ON lrt_dmas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lrt_profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role = 'owner'
        AND EXISTS (
          SELECT 1 FROM lrt_campaigns c
          WHERE c.id       = lrt_dmas.campaign_id
            AND c.is_active = true
        )
    )
  );


-- ----------------------------------------------------------------
-- 4. lrt_no_coverage_zips — same pattern as DMAs
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS lrt_no_coverage_zips_select_member ON lrt_no_coverage_zips;
DROP POLICY IF EXISTS lrt_no_coverage_zips_select_owner  ON lrt_no_coverage_zips; -- idempotent safety

CREATE POLICY lrt_no_coverage_zips_select_owner ON lrt_no_coverage_zips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lrt_profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role = 'owner'
        AND EXISTS (
          SELECT 1 FROM lrt_campaigns c
          WHERE c.id       = lrt_no_coverage_zips.campaign_id
            AND c.is_active = true
        )
    )
  );


-- ----------------------------------------------------------------
-- 5. lrt_sla_configs — owners need read access to render SLA
--    deadline info on their request detail view
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS lrt_sla_configs_select_owner ON lrt_sla_configs;

CREATE POLICY lrt_sla_configs_select_owner ON lrt_sla_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lrt_profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role = 'owner'
    )
  );
