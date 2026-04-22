-- Already applied live on 2026-04-21. Do not re-run supabase db push.
-- Apply manually in Supabase SQL editor when ready.

ALTER TABLE public.lrt_import_rows
  ADD COLUMN IF NOT EXISTS commit_payload jsonb;

-- -----------------------------------------------------------------------------
-- Helpers: match TS `normalizeString` for office equality in SQL
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lrt_normalize_import_text(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(trim(coalesce(t, '')), ',|\.', ' ', 'g'),
      '\s+',
      ' ',
      'g'
    )
  );
$$;

-- -----------------------------------------------------------------------------
-- Candidate rows for tier 2/3 import matching
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lrt_import_match_candidates(
  p_campaign_id uuid,
  p_office_norm text,
  p_lead_type text,
  p_date_lo date,
  p_date_hi date
)
RETURNS SETOF public.lrt_lead_requests
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT lr.*
  FROM public.lrt_lead_requests lr
  WHERE lr.campaign_id = p_campaign_id
    AND public.lrt_normalize_import_text(lr.office) = p_office_norm
    AND lr.lead_type = p_lead_type
    AND (
      (lr.att_submitted_at IS NOT NULL
        AND (lr.att_submitted_at::date BETWEEN p_date_lo AND p_date_hi))
      OR
      (lr.att_submitted_at IS NULL
        AND (lr.created_at::date BETWEEN p_date_lo AND p_date_hi))
    );
$$;

GRANT EXECUTE ON FUNCTION public.lrt_import_match_candidates(uuid, text, text, date, date) TO authenticated;

-- -----------------------------------------------------------------------------
-- Atomic commit for an import preview (reads `commit_payload` on each row)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.commit_att_import(
  p_import_id uuid,
  p_committed_by_profile uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  payload jsonb;
  v_patch jsonb;
  v_vals jsonb;
  v_req uuid;
  v_new_id uuid;
  applied_u int := 0;
  applied_i int := 0;
  applied_r int := 0;
  skip_amb int := 0;
  v_import public.lrt_imports%rowtype;
  audit_arr jsonb;
  audit_item jsonb;
  audit_idx int;
  audit_len int;
BEGIN
  IF NOT public.lrt_is_territory_team() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO v_import FROM public.lrt_imports WHERE id = p_import_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'import not found';
  END IF;

  IF v_import.status <> 'preview' THEN
    RAISE EXCEPTION 'import not in preview status';
  END IF;

  FOR r IN
    SELECT *
    FROM public.lrt_import_rows
    WHERE import_id = p_import_id
    ORDER BY sheet_row_index
  LOOP
    IF r.match_status = 'ambiguous_unresolved' THEN
      skip_amb := skip_amb + 1;
      CONTINUE;
    END IF;

    IF r.match_status NOT IN ('matched', 'new', 'ambiguous_resolved') THEN
      CONTINUE;
    END IF;

    payload := r.commit_payload;
    IF payload IS NULL THEN
      CONTINUE;
    END IF;

    IF payload->>'op' = 'update' THEN
      v_req := (payload->>'request_id')::uuid;
      v_patch := payload->'patch';

      UPDATE public.lrt_lead_requests lr
      SET
        office = CASE WHEN v_patch ? 'office' THEN (v_patch->>'office')::text ELSE lr.office END,
        dealer_code = CASE WHEN v_patch ? 'dealer_code' THEN (v_patch->>'dealer_code')::text ELSE lr.dealer_code END,
        dma = CASE WHEN v_patch ? 'dma' THEN (v_patch->>'dma')::text ELSE lr.dma END,
        lead_area_requested = CASE WHEN v_patch ? 'lead_area_requested' THEN (v_patch->>'lead_area_requested')::text ELSE lr.lead_area_requested END,
        lead_type = CASE WHEN v_patch ? 'lead_type' THEN (v_patch->>'lead_type')::text ELSE lr.lead_type END,
        status = CASE WHEN v_patch ? 'status' THEN (v_patch->>'status')::text ELSE lr.status END,
        att_submitted_at = CASE WHEN v_patch ? 'att_submitted_at' THEN (v_patch->>'att_submitted_at')::timestamptz ELSE lr.att_submitted_at END,
        att_confirmation_number = CASE WHEN v_patch ? 'att_confirmation_number' THEN (v_patch->>'att_confirmation_number')::text ELSE lr.att_confirmation_number END,
        updated_at = now()
      WHERE lr.id = v_req;

      audit_arr := COALESCE(payload->'audit', '[]'::jsonb);
      audit_len := COALESCE(jsonb_array_length(audit_arr), 0);
      audit_idx := 0;
      WHILE audit_idx < audit_len LOOP
        audit_item := audit_arr->audit_idx;
        INSERT INTO public.lrt_audit_log (request_id, changed_by, field_name, old_value, new_value)
        VALUES (
          v_req,
          p_committed_by_profile,
          NULLIF(trim(audit_item->>'field_name'), ''),
          audit_item->>'old_value',
          audit_item->>'new_value'
        );
        audit_idx := audit_idx + 1;
      END LOOP;

      applied_u := applied_u + 1;
      IF r.match_status = 'ambiguous_resolved' THEN
        applied_r := applied_r + 1;
      END IF;

    ELSIF payload->>'op' = 'insert' THEN
      v_vals := payload->'values';

      INSERT INTO public.lrt_lead_requests (
        campaign_id,
        owner_id,
        submitted_by,
        submitted_on_behalf,
        admin_submitted,
        admin_submitted_by,
        admin_submitted_at,
        created_at,
        lead_type,
        area_type,
        lead_area_requested,
        office,
        dealer_code,
        dma,
        status,
        att_submitted_at,
        att_confirmation_number,
        form_data,
        sla_status,
        is_reserve
      )
      VALUES (
        (v_vals->>'campaign_id')::uuid,
        (v_vals->>'owner_id')::uuid,
        (v_vals->>'submitted_by')::uuid,
        COALESCE((v_vals->>'submitted_on_behalf')::boolean, false),
        COALESCE((v_vals->>'admin_submitted')::boolean, false),
        (v_vals->>'admin_submitted_by')::uuid,
        (v_vals->>'admin_submitted_at')::timestamptz,
        (v_vals->>'created_at')::timestamptz,
        v_vals->>'lead_type',
        v_vals->>'area_type',
        v_vals->>'lead_area_requested',
        NULLIF(v_vals->>'office', ''),
        NULLIF(v_vals->>'dealer_code', ''),
        NULLIF(v_vals->>'dma', ''),
        v_vals->>'status',
        (v_vals->>'att_submitted_at')::timestamptz,
        NULLIF(v_vals->>'att_confirmation_number', ''),
        COALESCE((v_vals->'form_data')::jsonb, '{}'::jsonb),
        COALESCE(v_vals->>'sla_status', 'on_track'),
        COALESCE((v_vals->>'is_reserve')::boolean, false)
      )
      RETURNING id INTO v_new_id;

      audit_arr := COALESCE(payload->'audit', '[]'::jsonb);
      audit_len := COALESCE(jsonb_array_length(audit_arr), 0);
      audit_idx := 0;
      WHILE audit_idx < audit_len LOOP
        audit_item := audit_arr->audit_idx;
        INSERT INTO public.lrt_audit_log (request_id, changed_by, field_name, old_value, new_value)
        VALUES (
          v_new_id,
          p_committed_by_profile,
          NULLIF(trim(audit_item->>'field_name'), ''),
          audit_item->>'old_value',
          audit_item->>'new_value'
        );
        audit_idx := audit_idx + 1;
      END LOOP;

      applied_i := applied_i + 1;
    ELSE
      CONTINUE;
    END IF;

    UPDATE public.lrt_import_rows
    SET
      match_status = 'applied',
      applied_at = now(),
      commit_payload = NULL
    WHERE id = r.id;
  END LOOP;

  UPDATE public.lrt_imports
  SET
    status = 'committed',
    committed_at = now(),
    committed_by = p_committed_by_profile,
    applied_updates = applied_u,
    applied_inserts = applied_i,
    applied_resolved = applied_r,
    skipped_ambiguous = skip_amb
  WHERE id = p_import_id;

  RETURN jsonb_build_object(
    'applied_updates', applied_u,
    'applied_inserts', applied_i,
    'applied_resolved', applied_r,
    'skipped_ambiguous', skip_amb
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.commit_att_import(uuid, uuid) TO authenticated;
