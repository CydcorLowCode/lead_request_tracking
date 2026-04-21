CREATE OR REPLACE PROCEDURE backfill_incremental(p_since timestamptz DEFAULT now() - interval '48 hours')
LANGUAGE plpgsql
AS $proc$
DECLARE
  n int;
  total int := 0;
BEGIN
  RAISE NOTICE 'Incremental backfill: modified_at >= %', p_since;

  -- parent_leads (6 FKs)
  UPDATE parent_leads pl SET
    territory_uuid    = COALESCE(pl.territory_uuid,    tr.id),
    icl_uuid          = COALESCE(pl.icl_uuid,          i.id),
    assigned_rep_uuid = COALESCE(pl.assigned_rep_uuid, u.id),
    mdu_uuid          = COALESCE(pl.mdu_uuid,          m.id),
    building_uuid     = COALESCE(pl.building_uuid,     b.id),
    floor_uuid        = COALESCE(pl.floor_uuid,        f.id)
  FROM (
    SELECT id, territory1_custom_territory, icl_custom_icl, assigned_rep1_user,
           related_mdu_custom_mdu, related_building_custom_building, related_floor_custom_floor
    FROM parent_leads
    WHERE modified_at >= p_since
      AND (
        (territory_uuid IS NULL AND territory1_custom_territory IS NOT NULL) OR
        (icl_uuid IS NULL AND icl_custom_icl IS NOT NULL) OR
        (assigned_rep_uuid IS NULL AND assigned_rep1_user IS NOT NULL) OR
        (mdu_uuid IS NULL AND related_mdu_custom_mdu IS NOT NULL) OR
        (building_uuid IS NULL AND related_building_custom_building IS NOT NULL) OR
        (floor_uuid IS NULL AND related_floor_custom_floor IS NOT NULL)
      )
  ) src
  LEFT JOIN territories tr ON src.territory1_custom_territory = tr.bubble_id
  LEFT JOIN icls i         ON src.icl_custom_icl = i.bubble_id
  LEFT JOIN users u        ON src.assigned_rep1_user = u.bubble_id
  LEFT JOIN mdus m         ON src.related_mdu_custom_mdu = m.bubble_id
  LEFT JOIN buildings b    ON src.related_building_custom_building = b.bubble_id
  LEFT JOIN floors f       ON src.related_floor_custom_floor = f.bubble_id
  WHERE pl.id = src.id
    AND (tr.id IS NOT NULL OR i.id IS NOT NULL OR u.id IS NOT NULL
         OR m.id IS NOT NULL OR b.id IS NOT NULL OR f.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'parent_leads      %', n;
  COMMIT;

  -- aci (8 FKs)
  UPDATE aci a SET
    parent_lead_uuid         = COALESCE(a.parent_lead_uuid,         pla.id),
    child_lead_uuid          = COALESCE(a.child_lead_uuid,          cl.id),
    icl_uuid                 = COALESCE(a.icl_uuid,                 i.id),
    territory_uuid           = COALESCE(a.territory_uuid,           tr.id),
    sales_rep_uuid           = COALESCE(a.sales_rep_uuid,           u.id),
    program_record_uuid      = COALESCE(a.program_record_uuid,      pr.id),
    campaign_assignment_uuid = COALESCE(a.campaign_assignment_uuid, ca.id),
    order_uuid               = COALESCE(a.order_uuid,               o.id)
  FROM (
    SELECT id, parent_lead_custom_parent_lead, child_lead_name_custom_child_lead,
           icl_custom_icl, territory_custom_territory, sales_rep_user,
           program_record_custom_program_record,
           related_campaign_assignment_custom_campaign_assignment,
           related_order_custom_orders
    FROM aci
    WHERE modified_at >= p_since
      AND (
        (parent_lead_uuid IS NULL AND parent_lead_custom_parent_lead IS NOT NULL) OR
        (child_lead_uuid IS NULL AND child_lead_name_custom_child_lead IS NOT NULL) OR
        (icl_uuid IS NULL AND icl_custom_icl IS NOT NULL) OR
        (territory_uuid IS NULL AND territory_custom_territory IS NOT NULL) OR
        (sales_rep_uuid IS NULL AND sales_rep_user IS NOT NULL) OR
        (program_record_uuid IS NULL AND program_record_custom_program_record IS NOT NULL) OR
        (campaign_assignment_uuid IS NULL AND related_campaign_assignment_custom_campaign_assignment IS NOT NULL) OR
        (order_uuid IS NULL AND related_order_custom_orders IS NOT NULL)
      )
  ) src
  LEFT JOIN parent_leads pla      ON src.parent_lead_custom_parent_lead = pla.bubble_id
  LEFT JOIN child_leads cl        ON src.child_lead_name_custom_child_lead = cl.bubble_id
  LEFT JOIN icls i                ON src.icl_custom_icl = i.bubble_id
  LEFT JOIN territories tr        ON src.territory_custom_territory = tr.bubble_id
  LEFT JOIN users u               ON src.sales_rep_user = u.bubble_id
  LEFT JOIN program_records pr    ON src.program_record_custom_program_record = pr.bubble_id
  LEFT JOIN campaign_assignments ca ON src.related_campaign_assignment_custom_campaign_assignment = ca.bubble_id
  LEFT JOIN orders o              ON src.related_order_custom_orders = o.bubble_id
  WHERE a.id = src.id
    AND (pla.id IS NOT NULL OR cl.id IS NOT NULL OR i.id IS NOT NULL
         OR tr.id IS NOT NULL OR u.id IS NOT NULL OR pr.id IS NOT NULL
         OR ca.id IS NOT NULL OR o.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'aci               %', n;
  COMMIT;

  -- program_records (5 FKs)
  UPDATE program_records p SET
    user_uuid                = COALESCE(p.user_uuid,                u.id),
    icl_uuid                 = COALESCE(p.icl_uuid,                 i.id),
    territory_uuid           = COALESCE(p.territory_uuid,           tr.id),
    day_uuid                 = COALESCE(p.day_uuid,                 d.id),
    campaign_assignment_uuid = COALESCE(p.campaign_assignment_uuid, ca.id)
  FROM (
    SELECT id, related_user_user, related_icl_custom_icl,
           related_territory_custom_territory, related_day_custom_day,
           related_campaign_assignment_custom_campaign_assignment
    FROM program_records
    WHERE modified_at >= p_since
      AND (
        (user_uuid IS NULL AND related_user_user IS NOT NULL) OR
        (icl_uuid IS NULL AND related_icl_custom_icl IS NOT NULL) OR
        (territory_uuid IS NULL AND related_territory_custom_territory IS NOT NULL) OR
        (day_uuid IS NULL AND related_day_custom_day IS NOT NULL) OR
        (campaign_assignment_uuid IS NULL AND related_campaign_assignment_custom_campaign_assignment IS NOT NULL)
      )
  ) src
  LEFT JOIN users u                 ON src.related_user_user = u.bubble_id
  LEFT JOIN icls i                  ON src.related_icl_custom_icl = i.bubble_id
  LEFT JOIN territories tr          ON src.related_territory_custom_territory = tr.bubble_id
  LEFT JOIN days d                  ON src.related_day_custom_day = d.bubble_id
  LEFT JOIN campaign_assignments ca ON src.related_campaign_assignment_custom_campaign_assignment = ca.bubble_id
  WHERE p.id = src.id
    AND (u.id IS NOT NULL OR i.id IS NOT NULL OR tr.id IS NOT NULL
         OR d.id IS NOT NULL OR ca.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'program_records   %', n;
  COMMIT;

  -- child_leads (1 FK)
  UPDATE child_leads clead SET parent_lead_uuid = pl.id
  FROM (
    SELECT id,
           COALESCE(parent_lead_custom_parent_lead, parent_lead_id_custom_parent_lead) AS ref
    FROM child_leads
    WHERE modified_at >= p_since
      AND parent_lead_uuid IS NULL
      AND (parent_lead_custom_parent_lead IS NOT NULL
           OR parent_lead_id_custom_parent_lead IS NOT NULL)
  ) src
  JOIN parent_leads pl ON src.ref = pl.bubble_id
  WHERE clead.id = src.id;
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'child_leads       %', n;
  COMMIT;

  -- notes (5 FKs)
  UPDATE notes nt SET
    parent_lead_uuid = COALESCE(nt.parent_lead_uuid, pl.id),
    child_lead_uuid  = COALESCE(nt.child_lead_uuid,  cl.id),
    order_uuid       = COALESCE(nt.order_uuid,       o.id),
    territory_uuid   = COALESCE(nt.territory_uuid,   tr.id),
    contact_uuid     = COALESCE(nt.contact_uuid,     c.id)
  FROM (
    SELECT id, related_parent_lead_custom_parent_lead, related_child_lead_custom_child_lead,
           related_order_custom_orders, related_territory_custom_territory,
           related_referral_custom_contact
    FROM notes
    WHERE modified_at >= p_since
      AND (
        (parent_lead_uuid IS NULL AND related_parent_lead_custom_parent_lead IS NOT NULL) OR
        (child_lead_uuid IS NULL AND related_child_lead_custom_child_lead IS NOT NULL) OR
        (order_uuid IS NULL AND related_order_custom_orders IS NOT NULL) OR
        (territory_uuid IS NULL AND related_territory_custom_territory IS NOT NULL) OR
        (contact_uuid IS NULL AND related_referral_custom_contact IS NOT NULL)
      )
  ) src
  LEFT JOIN parent_leads pl ON src.related_parent_lead_custom_parent_lead = pl.bubble_id
  LEFT JOIN child_leads cl  ON src.related_child_lead_custom_child_lead = cl.bubble_id
  LEFT JOIN orders o        ON src.related_order_custom_orders = o.bubble_id
  LEFT JOIN territories tr  ON src.related_territory_custom_territory = tr.bubble_id
  LEFT JOIN contacts c      ON src.related_referral_custom_contact = c.bubble_id
  WHERE nt.id = src.id
    AND (pl.id IS NOT NULL OR cl.id IS NOT NULL OR o.id IS NOT NULL
         OR tr.id IS NOT NULL OR c.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'notes             %', n;
  COMMIT;

  -- route_stops (3 FKs)
  UPDATE route_stops rs SET
    route_uuid       = COALESCE(rs.route_uuid,       rt.id),
    parent_lead_uuid = COALESCE(rs.parent_lead_uuid, pl.id),
    mdu_uuid         = COALESCE(rs.mdu_uuid,         md.id)
  FROM (
    SELECT id, related_route_custom_route, related_parent_lead_custom_parent_lead,
           related_mdu_custom_mdu
    FROM route_stops
    WHERE modified_at >= p_since
      AND (
        (route_uuid IS NULL AND related_route_custom_route IS NOT NULL) OR
        (parent_lead_uuid IS NULL AND related_parent_lead_custom_parent_lead IS NOT NULL) OR
        (mdu_uuid IS NULL AND related_mdu_custom_mdu IS NOT NULL)
      )
  ) src
  LEFT JOIN routes rt       ON src.related_route_custom_route = rt.bubble_id
  LEFT JOIN parent_leads pl ON src.related_parent_lead_custom_parent_lead = pl.bubble_id
  LEFT JOIN mdus md         ON src.related_mdu_custom_mdu = md.bubble_id
  WHERE rs.id = src.id
    AND (rt.id IS NOT NULL OR pl.id IS NOT NULL OR md.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'route_stops       %', n;
  COMMIT;

  -- calendar_events (6 FKs)
  UPDATE calendar_events ce SET
    parent_lead_uuid         = COALESCE(ce.parent_lead_uuid,         pl.id),
    child_lead_uuid          = COALESCE(ce.child_lead_uuid,          cl.id),
    user_uuid                = COALESCE(ce.user_uuid,                u.id),
    territory_uuid           = COALESCE(ce.territory_uuid,           tr.id),
    icl_uuid                 = COALESCE(ce.icl_uuid,                 i.id),
    campaign_assignment_uuid = COALESCE(ce.campaign_assignment_uuid, ca.id)
  FROM (
    SELECT id, related_parent_lead_custom_parent_lead, related_child_lead_custom_child_lead,
           related_user_user, related_territory_custom_territory,
           related_icl_custom_icl, related_campaign_assignment_custom_campaign_assignment
    FROM calendar_events
    WHERE modified_at >= p_since
      AND (
        (parent_lead_uuid IS NULL AND related_parent_lead_custom_parent_lead IS NOT NULL) OR
        (child_lead_uuid IS NULL AND related_child_lead_custom_child_lead IS NOT NULL) OR
        (user_uuid IS NULL AND related_user_user IS NOT NULL) OR
        (territory_uuid IS NULL AND related_territory_custom_territory IS NOT NULL) OR
        (icl_uuid IS NULL AND related_icl_custom_icl IS NOT NULL) OR
        (campaign_assignment_uuid IS NULL AND related_campaign_assignment_custom_campaign_assignment IS NOT NULL)
      )
  ) src
  LEFT JOIN parent_leads pl         ON src.related_parent_lead_custom_parent_lead = pl.bubble_id
  LEFT JOIN child_leads cl          ON src.related_child_lead_custom_child_lead = cl.bubble_id
  LEFT JOIN users u                 ON src.related_user_user = u.bubble_id
  LEFT JOIN territories tr          ON src.related_territory_custom_territory = tr.bubble_id
  LEFT JOIN icls i                  ON src.related_icl_custom_icl = i.bubble_id
  LEFT JOIN campaign_assignments ca ON src.related_campaign_assignment_custom_campaign_assignment = ca.bubble_id
  WHERE ce.id = src.id
    AND (pl.id IS NOT NULL OR cl.id IS NOT NULL OR u.id IS NOT NULL
         OR tr.id IS NOT NULL OR i.id IS NOT NULL OR ca.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'calendar_events   %', n;
  COMMIT;

  -- sales_agent_statistics (4 FKs)
  UPDATE sales_agent_statistics s SET
    user_uuid                = COALESCE(s.user_uuid,                u.id),
    icl_uuid                 = COALESCE(s.icl_uuid,                 i.id),
    campaign_assignment_uuid = COALESCE(s.campaign_assignment_uuid, ca.id),
    territory_uuid           = COALESCE(s.territory_uuid,           tr.id)
  FROM (
    SELECT id, related_user_user, related_icl_custom_icl,
           related_campaign_assignment_custom_campaign_assignment,
           related_territory_custom_territory
    FROM sales_agent_statistics
    WHERE modified_at >= p_since
      AND (
        (user_uuid IS NULL AND related_user_user IS NOT NULL) OR
        (icl_uuid IS NULL AND related_icl_custom_icl IS NOT NULL) OR
        (campaign_assignment_uuid IS NULL AND related_campaign_assignment_custom_campaign_assignment IS NOT NULL) OR
        (territory_uuid IS NULL AND related_territory_custom_territory IS NOT NULL)
      )
  ) src
  LEFT JOIN users u                 ON src.related_user_user = u.bubble_id
  LEFT JOIN icls i                  ON src.related_icl_custom_icl = i.bubble_id
  LEFT JOIN campaign_assignments ca ON src.related_campaign_assignment_custom_campaign_assignment = ca.bubble_id
  LEFT JOIN territories tr          ON src.related_territory_custom_territory = tr.bubble_id
  WHERE s.id = src.id
    AND (u.id IS NOT NULL OR i.id IS NOT NULL OR ca.id IS NOT NULL OR tr.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'sas               %', n;
  COMMIT;

  -- orders (9 FKs)
  UPDATE orders o SET
    parent_lead_uuid         = COALESCE(o.parent_lead_uuid,         pl.id),
    child_lead_uuid          = COALESCE(o.child_lead_uuid,          cl.id),
    icl_uuid                 = COALESCE(o.icl_uuid,                 i.id),
    territory_uuid           = COALESCE(o.territory_uuid,           tr.id),
    sales_rep_uuid           = COALESCE(o.sales_rep_uuid,           u1.id),
    assigned_rep_uuid        = COALESCE(o.assigned_rep_uuid,        u2.id),
    campaign_assignment_uuid = COALESCE(o.campaign_assignment_uuid, ca.id),
    retail_store_uuid        = COALESCE(o.retail_store_uuid,        rs.id),
    survey_uuid              = COALESCE(o.survey_uuid,              sv.id)
  FROM (
    SELECT id, parent_lead_id_custom_parent_lead, child_lead_id_custom_child_lead,
           icl_custom_icl, territory_id_custom_territory, sales_rep_user,
           appointment_booked_by_user, related_campaign_assignment_custom_campaign_assignment,
           related_retail_stores_custom_retail_stores, related_survey_custom_surveys
    FROM orders
    WHERE modified_at >= p_since
      AND (
        (parent_lead_uuid IS NULL AND parent_lead_id_custom_parent_lead IS NOT NULL) OR
        (child_lead_uuid IS NULL AND child_lead_id_custom_child_lead IS NOT NULL) OR
        (icl_uuid IS NULL AND icl_custom_icl IS NOT NULL) OR
        (territory_uuid IS NULL AND territory_id_custom_territory IS NOT NULL) OR
        (sales_rep_uuid IS NULL AND sales_rep_user IS NOT NULL) OR
        (assigned_rep_uuid IS NULL AND appointment_booked_by_user IS NOT NULL) OR
        (campaign_assignment_uuid IS NULL AND related_campaign_assignment_custom_campaign_assignment IS NOT NULL) OR
        (retail_store_uuid IS NULL AND related_retail_stores_custom_retail_stores IS NOT NULL) OR
        (survey_uuid IS NULL AND related_survey_custom_surveys IS NOT NULL)
      )
  ) src
  LEFT JOIN parent_leads pl         ON src.parent_lead_id_custom_parent_lead = pl.bubble_id
  LEFT JOIN child_leads cl          ON src.child_lead_id_custom_child_lead = cl.bubble_id
  LEFT JOIN icls i                  ON src.icl_custom_icl = i.bubble_id
  LEFT JOIN territories tr          ON src.territory_id_custom_territory = tr.bubble_id
  LEFT JOIN users u1                ON src.sales_rep_user = u1.bubble_id
  LEFT JOIN users u2                ON src.appointment_booked_by_user = u2.bubble_id
  LEFT JOIN campaign_assignments ca ON src.related_campaign_assignment_custom_campaign_assignment = ca.bubble_id
  LEFT JOIN retail_stores rs        ON src.related_retail_stores_custom_retail_stores = rs.bubble_id
  LEFT JOIN surveys sv              ON src.related_survey_custom_surveys = sv.bubble_id
  WHERE o.id = src.id
    AND (pl.id IS NOT NULL OR cl.id IS NOT NULL OR i.id IS NOT NULL
         OR tr.id IS NOT NULL OR u1.id IS NOT NULL OR u2.id IS NOT NULL
         OR ca.id IS NOT NULL OR rs.id IS NOT NULL OR sv.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'orders            %', n;
  COMMIT;

  -- products (3 FKs)
  UPDATE products p SET
    order_uuid       = COALESCE(p.order_uuid,       o.id),
    parent_lead_uuid = COALESCE(p.parent_lead_uuid, pl.id),
    child_lead_uuid  = COALESCE(p.child_lead_uuid,  cl.id)
  FROM (
    SELECT id, related_order_custom_orders, related_parent_lead_custom_parent_lead,
           related_child_lead_custom_child_lead
    FROM products
    WHERE modified_at >= p_since
      AND (
        (order_uuid IS NULL AND related_order_custom_orders IS NOT NULL) OR
        (parent_lead_uuid IS NULL AND related_parent_lead_custom_parent_lead IS NOT NULL) OR
        (child_lead_uuid IS NULL AND related_child_lead_custom_child_lead IS NOT NULL)
      )
  ) src
  LEFT JOIN orders o        ON src.related_order_custom_orders = o.bubble_id
  LEFT JOIN parent_leads pl ON src.related_parent_lead_custom_parent_lead = pl.bubble_id
  LEFT JOIN child_leads cl  ON src.related_child_lead_custom_child_lead = cl.bubble_id
  WHERE p.id = src.id
    AND (o.id IS NOT NULL OR pl.id IS NOT NULL OR cl.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'products          %', n;
  COMMIT;

  -- surveys (4 FKs)
  UPDATE surveys s SET
    order_uuid       = COALESCE(s.order_uuid,       o.id),
    parent_lead_uuid = COALESCE(s.parent_lead_uuid, pl.id),
    sales_rep_uuid   = COALESCE(s.sales_rep_uuid,   u.id),
    icl_uuid         = COALESCE(s.icl_uuid,         i.id)
  FROM (
    SELECT id, related_order_custom_orders, related_parent_lead_custom_parent_lead,
           sales_rep_user, icl_custom_icl
    FROM surveys
    WHERE modified_at >= p_since
      AND (
        (order_uuid IS NULL AND related_order_custom_orders IS NOT NULL) OR
        (parent_lead_uuid IS NULL AND related_parent_lead_custom_parent_lead IS NOT NULL) OR
        (sales_rep_uuid IS NULL AND sales_rep_user IS NOT NULL) OR
        (icl_uuid IS NULL AND icl_custom_icl IS NOT NULL)
      )
  ) src
  LEFT JOIN orders o        ON src.related_order_custom_orders = o.bubble_id
  LEFT JOIN parent_leads pl ON src.related_parent_lead_custom_parent_lead = pl.bubble_id
  LEFT JOIN users u         ON src.sales_rep_user = u.bubble_id
  LEFT JOIN icls i          ON src.icl_custom_icl = i.bubble_id
  WHERE s.id = src.id
    AND (o.id IS NOT NULL OR pl.id IS NOT NULL OR u.id IS NOT NULL OR i.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'surveys           %', n;
  COMMIT;

  -- campaign_assignments (3 FKs)
  UPDATE campaign_assignments ca SET
    user_uuid      = COALESCE(ca.user_uuid,      u.id),
    icl_uuid       = COALESCE(ca.icl_uuid,       i.id),
    territory_uuid = COALESCE(ca.territory_uuid, tr.id)
  FROM (
    SELECT id, related_user_user, related_icl_custom_icl, related_territory_custom_territory
    FROM campaign_assignments
    WHERE modified_at >= p_since
      AND (
        (user_uuid IS NULL AND related_user_user IS NOT NULL) OR
        (icl_uuid IS NULL AND related_icl_custom_icl IS NOT NULL) OR
        (territory_uuid IS NULL AND related_territory_custom_territory IS NOT NULL)
      )
  ) src
  LEFT JOIN users u        ON src.related_user_user = u.bubble_id
  LEFT JOIN icls i         ON src.related_icl_custom_icl = i.bubble_id
  LEFT JOIN territories tr ON src.related_territory_custom_territory = tr.bubble_id
  WHERE ca.id = src.id
    AND (u.id IS NOT NULL OR i.id IS NOT NULL OR tr.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'campaign_assign   %', n;
  COMMIT;

  -- session_logs (1 FK)
  UPDATE session_logs sl SET user_uuid = u.id
  FROM users u
  WHERE sl.related_user_user = u.bubble_id
    AND sl.modified_at >= p_since
    AND sl.user_uuid IS NULL AND sl.related_user_user IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'session_logs      %', n;
  COMMIT;

  -- territory_snapshots (7 FKs)
  UPDATE territory_snapshots ts SET
    territory_uuid               = COALESCE(ts.territory_uuid,               tr.id),
    icl_uuid                     = COALESCE(ts.icl_uuid,                     i.id),
    zip_code_icl_assignment_uuid = COALESCE(ts.zip_code_icl_assignment_uuid, z.id),
    zip_code_assignment_uuid     = COALESCE(ts.zip_code_assignment_uuid,     za.id),
    sales_rep_uuid               = COALESCE(ts.sales_rep_uuid,               u1.id),
    primary_rep_uuid             = COALESCE(ts.primary_rep_uuid,             u2.id),
    secondary_rep_uuid           = COALESCE(ts.secondary_rep_uuid,           u3.id)
  FROM (
    SELECT id, related_territory_custom_territory, assigned_icl_custom_icl,
           related_zip_code_assignment_custom_zip_code_icl__assignments,
           related_zip_code_custom_zip_code_assignments,
           sales_rep_user, primary_rep_user, secondary_rep_user
    FROM territory_snapshots
    WHERE modified_at >= p_since
      AND (
        (territory_uuid IS NULL AND related_territory_custom_territory IS NOT NULL) OR
        (icl_uuid IS NULL AND assigned_icl_custom_icl IS NOT NULL) OR
        (zip_code_icl_assignment_uuid IS NULL AND related_zip_code_assignment_custom_zip_code_icl__assignments IS NOT NULL) OR
        (zip_code_assignment_uuid IS NULL AND related_zip_code_custom_zip_code_assignments IS NOT NULL) OR
        (sales_rep_uuid IS NULL AND sales_rep_user IS NOT NULL) OR
        (primary_rep_uuid IS NULL AND primary_rep_user IS NOT NULL) OR
        (secondary_rep_uuid IS NULL AND secondary_rep_user IS NOT NULL)
      )
  ) src
  LEFT JOIN territories tr               ON src.related_territory_custom_territory = tr.bubble_id
  LEFT JOIN icls i                       ON src.assigned_icl_custom_icl = i.bubble_id
  LEFT JOIN zip_code_icl_assignments z   ON src.related_zip_code_assignment_custom_zip_code_icl__assignments = z.bubble_id
  LEFT JOIN zip_code_assignments za      ON src.related_zip_code_custom_zip_code_assignments = za.bubble_id
  LEFT JOIN users u1                     ON src.sales_rep_user = u1.bubble_id
  LEFT JOIN users u2                     ON src.primary_rep_user = u2.bubble_id
  LEFT JOIN users u3                     ON src.secondary_rep_user = u3.bubble_id
  WHERE ts.id = src.id
    AND (tr.id IS NOT NULL OR i.id IS NOT NULL OR z.id IS NOT NULL OR za.id IS NOT NULL
         OR u1.id IS NOT NULL OR u2.id IS NOT NULL OR u3.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'territory_snaps   %', n;
  COMMIT;

  -- territories (2 FKs)
  UPDATE territories t SET
    icl_uuid          = COALESCE(t.icl_uuid,          i.id),
    assigned_rep_uuid = COALESCE(t.assigned_rep_uuid, u.id)
  FROM (
    SELECT id, assigned_icl_custom_icl, assigned_rep_user
    FROM territories
    WHERE modified_at >= p_since
      AND (
        (icl_uuid IS NULL AND assigned_icl_custom_icl IS NOT NULL) OR
        (assigned_rep_uuid IS NULL AND assigned_rep_user IS NOT NULL)
      )
  ) src
  LEFT JOIN icls i  ON src.assigned_icl_custom_icl = i.bubble_id
  LEFT JOIN users u ON src.assigned_rep_user = u.bubble_id
  WHERE t.id = src.id
    AND (i.id IS NOT NULL OR u.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'territories       %', n;
  COMMIT;

  -- zip_code_icl_assignments (3 FKs)
  UPDATE zip_code_icl_assignments zcia SET
    icl_uuid        = COALESCE(zcia.icl_uuid,        i1.id),
    shared_icl_uuid = COALESCE(zcia.shared_icl_uuid, i2.id),
    zip_code_uuid   = COALESCE(zcia.zip_code_uuid,   za.id)
  FROM (
    SELECT id, icl_custom_icl, shared_icl_custom_icl, zip_code_custom_zip_code_assignments
    FROM zip_code_icl_assignments
    WHERE modified_at >= p_since
      AND (
        (icl_uuid IS NULL AND icl_custom_icl IS NOT NULL) OR
        (shared_icl_uuid IS NULL AND shared_icl_custom_icl IS NOT NULL) OR
        (zip_code_uuid IS NULL AND zip_code_custom_zip_code_assignments IS NOT NULL)
      )
  ) src
  LEFT JOIN icls i1                 ON src.icl_custom_icl = i1.bubble_id
  LEFT JOIN icls i2                 ON src.shared_icl_custom_icl = i2.bubble_id
  LEFT JOIN zip_code_assignments za ON src.zip_code_custom_zip_code_assignments = za.bubble_id
  WHERE zcia.id = src.id
    AND (i1.id IS NOT NULL OR i2.id IS NOT NULL OR za.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'zip_code_icl_asn  %', n;
  COMMIT;

  -- routes (3 FKs)
  UPDATE routes rt SET
    icl_uuid       = COALESCE(rt.icl_uuid,       i.id),
    territory_uuid = COALESCE(rt.territory_uuid, tr.id),
    user_uuid      = COALESCE(rt.user_uuid,      u.id)
  FROM (
    SELECT id, related_icl_custom_icl, related_territory_custom_territory, icl_user
    FROM routes
    WHERE modified_at >= p_since
      AND (
        (icl_uuid IS NULL AND related_icl_custom_icl IS NOT NULL) OR
        (territory_uuid IS NULL AND related_territory_custom_territory IS NOT NULL) OR
        (user_uuid IS NULL AND icl_user IS NOT NULL)
      )
  ) src
  LEFT JOIN icls i         ON src.related_icl_custom_icl = i.bubble_id
  LEFT JOIN territories tr ON src.related_territory_custom_territory = tr.bubble_id
  LEFT JOIN users u        ON src.icl_user = u.bubble_id
  WHERE rt.id = src.id
    AND (i.id IS NOT NULL OR tr.id IS NOT NULL OR u.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'routes            %', n;
  COMMIT;

  -- floors (2 FKs)
  UPDATE floors f SET
    building_uuid = COALESCE(f.building_uuid, b.id),
    mdu_uuid      = COALESCE(f.mdu_uuid,      m.id)
  FROM (
    SELECT id, related_building_custom_building, related_mdu_custom_mdu
    FROM floors
    WHERE modified_at >= p_since
      AND (
        (building_uuid IS NULL AND related_building_custom_building IS NOT NULL) OR
        (mdu_uuid IS NULL AND related_mdu_custom_mdu IS NOT NULL)
      )
  ) src
  LEFT JOIN buildings b ON src.related_building_custom_building = b.bubble_id
  LEFT JOIN mdus m      ON src.related_mdu_custom_mdu = m.bubble_id
  WHERE f.id = src.id
    AND (b.id IS NOT NULL OR m.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'floors            %', n;
  COMMIT;

  -- buildings (1 FK)
  UPDATE buildings b SET mdu_uuid = m.id
  FROM mdus m
  WHERE b.related_mdu_custom_mdu = m.bubble_id
    AND b.modified_at >= p_since
    AND b.mdu_uuid IS NULL AND b.related_mdu_custom_mdu IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'buildings         %', n;
  COMMIT;

  -- mdus (1 FK)
  UPDATE mdus m SET territory_uuid = tr.id
  FROM territories tr
  WHERE m.related_territory_custom_territory = tr.bubble_id
    AND m.modified_at >= p_since
    AND m.territory_uuid IS NULL AND m.related_territory_custom_territory IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'mdus              %', n;
  COMMIT;

  -- collateral_logs (2 FKs)
  UPDATE collateral_logs clg SET
    parent_lead_uuid = COALESCE(clg.parent_lead_uuid, pl.id),
    rep_uuid         = COALESCE(clg.rep_uuid,          u.id)
  FROM (
    SELECT id, related_parent_lead_custom_parent_lead, rep_user
    FROM collateral_logs
    WHERE modified_at >= p_since
      AND (
        (parent_lead_uuid IS NULL AND related_parent_lead_custom_parent_lead IS NOT NULL) OR
        (rep_uuid IS NULL AND rep_user IS NOT NULL)
      )
  ) src
  LEFT JOIN parent_leads pl ON src.related_parent_lead_custom_parent_lead = pl.bubble_id
  LEFT JOIN users u         ON src.rep_user = u.bubble_id
  WHERE clg.id = src.id
    AND (pl.id IS NOT NULL OR u.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'collateral_logs   %', n;
  COMMIT;

  -- contacts (2 FKs)
  UPDATE contacts c SET
    sales_rep_uuid = COALESCE(c.sales_rep_uuid, u.id),
    icl_uuid       = COALESCE(c.icl_uuid,       i.id)
  FROM (
    SELECT id, sales_rep_user, originating_icl_custom_icl
    FROM contacts
    WHERE modified_at >= p_since
      AND (
        (sales_rep_uuid IS NULL AND sales_rep_user IS NOT NULL) OR
        (icl_uuid IS NULL AND originating_icl_custom_icl IS NOT NULL)
      )
  ) src
  LEFT JOIN users u ON src.sales_rep_user = u.bubble_id
  LEFT JOIN icls i  ON src.originating_icl_custom_icl = i.bubble_id
  WHERE c.id = src.id
    AND (u.id IS NOT NULL OR i.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'contacts          %', n;
  COMMIT;

  -- product_catalog (2 FKs)
  UPDATE product_catalog pc SET
    campaign_info_uuid    = COALESCE(pc.campaign_info_uuid,    ci.id),
    product_category_uuid = COALESCE(pc.product_category_uuid, pcat.id)
  FROM (
    SELECT id, related_order_config_custom_campaign_info,
           product_category1_custom_product_category
    FROM product_catalog
    WHERE modified_at >= p_since
      AND (
        (campaign_info_uuid IS NULL AND related_order_config_custom_campaign_info IS NOT NULL) OR
        (product_category_uuid IS NULL AND product_category1_custom_product_category IS NOT NULL)
      )
  ) src
  LEFT JOIN campaign_info ci       ON src.related_order_config_custom_campaign_info = ci.bubble_id
  LEFT JOIN product_categories pcat ON src.product_category1_custom_product_category = pcat.bubble_id
  WHERE pc.id = src.id
    AND (ci.id IS NOT NULL OR pcat.id IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;
  RAISE NOTICE 'product_catalog   %', n;
  COMMIT;

  RAISE NOTICE 'INCREMENTAL BACKFILL DONE  total_written=% (since %)', total, p_since;
END;
$proc$;;
