-- Owners may update/delete only their own requests (same row visibility as select).
-- Territory team continues to use lrt_lead_requests_update_tt / lrt_lead_requests_delete_tt.

DROP POLICY IF EXISTS lrt_lead_requests_update_owner ON public.lrt_lead_requests;
CREATE POLICY lrt_lead_requests_update_owner ON public.lrt_lead_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lrt_profiles p
      WHERE p.id = lrt_lead_requests.owner_id
        AND p.auth_user_id = auth.uid()
        AND COALESCE(p.is_active, true)
    )
    AND EXISTS (
      SELECT 1 FROM public.lrt_user_campaigns uc
      JOIN public.lrt_profiles p ON p.id = uc.profile_id
      WHERE p.auth_user_id = auth.uid()
        AND uc.campaign_id = lrt_lead_requests.campaign_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lrt_profiles p
      WHERE p.id = lrt_lead_requests.owner_id
        AND p.auth_user_id = auth.uid()
        AND COALESCE(p.is_active, true)
    )
    AND EXISTS (
      SELECT 1 FROM public.lrt_user_campaigns uc
      JOIN public.lrt_profiles p ON p.id = uc.profile_id
      WHERE p.auth_user_id = auth.uid()
        AND uc.campaign_id = lrt_lead_requests.campaign_id
    )
  );

DROP POLICY IF EXISTS lrt_lead_requests_delete_owner ON public.lrt_lead_requests;
CREATE POLICY lrt_lead_requests_delete_owner ON public.lrt_lead_requests
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lrt_profiles p
      WHERE p.id = lrt_lead_requests.owner_id
        AND p.auth_user_id = auth.uid()
        AND COALESCE(p.is_active, true)
    )
    AND EXISTS (
      SELECT 1 FROM public.lrt_user_campaigns uc
      JOIN public.lrt_profiles p ON p.id = uc.profile_id
      WHERE p.auth_user_id = auth.uid()
        AND uc.campaign_id = lrt_lead_requests.campaign_id
    )
  );
