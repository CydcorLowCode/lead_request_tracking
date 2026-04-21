
-- =============================================================================
-- LRT Phase 1 — Helper function, RLS policies, audit RPC, seeds
-- =============================================================================

-- Helper: is current auth user an LRT territory team member?
create or replace function public.lrt_is_territory_team()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lrt_profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'territory_team'
      and coalesce(p.is_active, true)
  );
$$;

comment on function public.lrt_is_territory_team() is
  'True when the current auth user has an active territory_team LRT profile.';

grant execute on function public.lrt_is_territory_team() to authenticated;

-- Audit append RPC (security definer — TT only)
create or replace function public.lrt_append_audit_log(
  p_request_id uuid,
  p_field_name text,
  p_old_value text,
  p_new_value text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_profile_id uuid;
begin
  if not public.lrt_is_territory_team() then
    raise exception 'not authorized';
  end if;
  select id into v_profile_id from public.lrt_profiles where auth_user_id = auth.uid();
  insert into public.lrt_audit_log (request_id, changed_by, field_name, old_value, new_value)
  values (p_request_id, v_profile_id, p_field_name, p_old_value, p_new_value)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.lrt_append_audit_log(uuid, text, text, text) to authenticated;

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.lrt_profiles enable row level security;
alter table public.lrt_campaigns enable row level security;
alter table public.lrt_user_campaigns enable row level security;
alter table public.lrt_lead_requests enable row level security;
alter table public.lrt_sla_configs enable row level security;
alter table public.lrt_audit_log enable row level security;
alter table public.lrt_dmas enable row level security;
alter table public.lrt_no_coverage_zips enable row level security;

-- lrt_profiles
create policy lrt_profiles_select_own on public.lrt_profiles
  for select to authenticated using (auth_user_id = auth.uid());

create policy lrt_profiles_select_tt on public.lrt_profiles
  for select to authenticated using (public.lrt_is_territory_team());

-- lrt_campaigns
create policy lrt_campaigns_select_tt on public.lrt_campaigns
  for select to authenticated using (public.lrt_is_territory_team());

create policy lrt_campaigns_select_member on public.lrt_campaigns
  for select to authenticated using (
    exists (
      select 1 from public.lrt_user_campaigns uc
      join public.lrt_profiles p on p.id = uc.profile_id
      where p.auth_user_id = auth.uid() and uc.campaign_id = lrt_campaigns.id
    )
  );

-- lrt_user_campaigns
create policy lrt_user_campaigns_select_own on public.lrt_user_campaigns
  for select to authenticated using (
    exists (
      select 1 from public.lrt_profiles p
      where p.id = lrt_user_campaigns.profile_id and p.auth_user_id = auth.uid()
    )
  );

create policy lrt_user_campaigns_select_tt on public.lrt_user_campaigns
  for select to authenticated using (public.lrt_is_territory_team());

-- lrt_lead_requests
create policy lrt_lead_requests_select on public.lrt_lead_requests
  for select to authenticated using (
    public.lrt_is_territory_team()
    or (
      exists (
        select 1 from public.lrt_profiles p
        where p.id = lrt_lead_requests.owner_id and p.auth_user_id = auth.uid()
      )
      and exists (
        select 1 from public.lrt_user_campaigns uc
        join public.lrt_profiles p on p.id = uc.profile_id
        where p.auth_user_id = auth.uid() and uc.campaign_id = lrt_lead_requests.campaign_id
      )
    )
  );

create policy lrt_lead_requests_insert_owner on public.lrt_lead_requests
  for insert to authenticated with check (
    exists (
      select 1 from public.lrt_profiles p
      where p.id = owner_id and p.auth_user_id = auth.uid() and coalesce(p.is_active, true)
    )
    and submitted_on_behalf = false
    and exists (
      select 1 from public.lrt_user_campaigns uc
      join public.lrt_profiles p on p.id = uc.profile_id
      where p.auth_user_id = auth.uid() and uc.campaign_id = campaign_id
    )
    and exists (
      select 1 from public.lrt_campaigns c where c.id = campaign_id and c.is_active = true
    )
  );

create policy lrt_lead_requests_insert_tt on public.lrt_lead_requests
  for insert to authenticated with check (
    public.lrt_is_territory_team()
    and exists (
      select 1 from public.lrt_campaigns c where c.id = campaign_id and c.is_active = true
    )
  );

create policy lrt_lead_requests_update_tt on public.lrt_lead_requests
  for update to authenticated
  using (public.lrt_is_territory_team())
  with check (public.lrt_is_territory_team());

-- lrt_sla_configs
create policy lrt_sla_configs_all_tt on public.lrt_sla_configs
  for all to authenticated
  using (public.lrt_is_territory_team())
  with check (public.lrt_is_territory_team());

-- lrt_audit_log
create policy lrt_audit_log_select_owner on public.lrt_audit_log
  for select to authenticated using (
    exists (
      select 1 from public.lrt_lead_requests lr
      join public.lrt_profiles p on p.id = lr.owner_id
      where lr.id = lrt_audit_log.request_id and p.auth_user_id = auth.uid()
    )
  );

create policy lrt_audit_log_select_tt on public.lrt_audit_log
  for select to authenticated using (public.lrt_is_territory_team());

-- lrt_dmas
create policy lrt_dmas_select_tt on public.lrt_dmas
  for select to authenticated using (public.lrt_is_territory_team());

create policy lrt_dmas_select_member on public.lrt_dmas
  for select to authenticated using (
    exists (
      select 1 from public.lrt_user_campaigns uc
      join public.lrt_profiles p on p.id = uc.profile_id
      where p.auth_user_id = auth.uid() and uc.campaign_id = lrt_dmas.campaign_id
    )
  );

create policy lrt_dmas_manage_tt on public.lrt_dmas
  for all to authenticated
  using (public.lrt_is_territory_team())
  with check (public.lrt_is_territory_team());

-- lrt_no_coverage_zips
create policy lrt_no_coverage_zips_select_tt on public.lrt_no_coverage_zips
  for select to authenticated using (public.lrt_is_territory_team());

create policy lrt_no_coverage_zips_select_member on public.lrt_no_coverage_zips
  for select to authenticated using (
    exists (
      select 1 from public.lrt_user_campaigns uc
      join public.lrt_profiles p on p.id = uc.profile_id
      where p.auth_user_id = auth.uid() and uc.campaign_id = lrt_no_coverage_zips.campaign_id
    )
  );

-- =============================================================================
-- Seeds
-- =============================================================================

-- AT&T Residential campaign
insert into public.lrt_campaigns (name, slug, is_active, config)
values (
  'AT&T Residential', 'att', true,
  '{
    "lead_types": [
      { "value": "permanent_assignment", "label": "Permanent Assignment",    "sla_hours": 240 },
      { "value": "business_trip",        "label": "Business Trip",           "sla_hours": 240 },
      { "value": "nlt_new_fiber",        "label": "NLT New Fiber",           "sla_hours": 48  },
      { "value": "market_proposal",      "label": "Market Proposal",         "sla_hours": 72  },
      { "value": "oof_wireless",         "label": "OOF/Wireless",            "sla_hours": 72  },
      { "value": "pullback",             "label": "Pullback/No Longer Needed","sla_hours": 72 }
    ],
    "area_types": ["zip", "market"],
    "coverage_check": true
  }'::jsonb
)
on conflict (slug) do update
set name = excluded.name, is_active = excluded.is_active, config = excluded.config;

-- SLA configs for AT&T
insert into public.lrt_sla_configs (campaign_id, lead_type, sla_hours, warning_hours)
select c.id, v.lead_type, v.sla_hours, v.warning_hours
from public.lrt_campaigns c
cross join (
  values
    ('permanent_assignment'::text, 240, 216),
    ('business_trip',              240, 216),
    ('nlt_new_fiber',               48,  24),
    ('market_proposal',             72,  48),
    ('oof_wireless',                72,  48),
    ('pullback',                    72,  48)
) as v(lead_type, sla_hours, warning_hours)
where c.slug = 'att'
on conflict (campaign_id, lead_type) do update
set sla_hours = excluded.sla_hours, warning_hours = excluded.warning_hours, updated_at = now();
;
