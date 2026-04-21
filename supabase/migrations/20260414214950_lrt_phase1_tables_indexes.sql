
-- =============================================================================
-- LRT Phase 1 — Tables and indexes only (functions/RLS/seeds in next migration)
-- =============================================================================

create extension if not exists "pgcrypto";

-- lrt_profiles
create table public.lrt_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('territory_team', 'owner')),
  icl_unified_code text,
  dealer_code text,
  legal_corp_name text,
  office_name text,
  sf_contact_id text,
  sf_synced_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index lrt_profiles_auth_user_id_idx on public.lrt_profiles (auth_user_id);
create index lrt_profiles_role_idx on public.lrt_profiles (role);
create index lrt_profiles_sf_contact_id_idx on public.lrt_profiles (sf_contact_id);
create index lrt_profiles_is_active_idx on public.lrt_profiles (is_active);

-- lrt_campaigns
create table public.lrt_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index lrt_campaigns_is_active_idx on public.lrt_campaigns (is_active);
create index lrt_campaigns_slug_idx on public.lrt_campaigns (slug);

-- lrt_user_campaigns
create table public.lrt_user_campaigns (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.lrt_profiles (id) on delete cascade,
  campaign_id uuid not null references public.lrt_campaigns (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, campaign_id)
);
create index lrt_user_campaigns_profile_id_idx on public.lrt_user_campaigns (profile_id);
create index lrt_user_campaigns_campaign_id_idx on public.lrt_user_campaigns (campaign_id);

-- lrt_lead_requests
create table public.lrt_lead_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  campaign_id uuid not null references public.lrt_campaigns (id) on delete restrict,
  owner_id uuid not null references public.lrt_profiles (id) on delete restrict,
  submitted_by uuid not null references public.lrt_profiles (id) on delete restrict,
  submitted_on_behalf boolean not null default false,
  lead_type text not null check (
    lead_type in (
      'permanent_assignment','business_trip','nlt_new_fiber',
      'market_proposal','oof_wireless','pullback'
    )
  ),
  area_type text not null check (area_type in ('zip', 'market')),
  lead_area_requested text not null,
  lead_area_requested_2 text,
  lead_area_requested_3 text,
  lead_area_requested_4 text,
  lead_area_requested_5 text,
  date_needed_by date,
  headcount integer,
  notes text,
  is_reserve boolean not null default false,
  dealer_code text,
  dma text,
  office text,
  status text not null default 'new' check (
    status in (
      'new','submitted_to_client','leads_received','visible_in_salesforce',
      'declined','market_proposal_answered','leads_pulled_back'
    )
  ),
  att_confirmation_number text,
  att_submitted_at timestamptz,
  att_response_at timestamptz,
  approved_zip_codes text,
  denied_zip_codes text,
  internal_notes text,
  notes_for_icl text,
  sf_visibility_date timestamptz,
  decline_date timestamptz,
  sla_due_at timestamptz,
  sla_status text not null default 'on_track' check (
    sla_status in ('on_track','at_risk','overdue','completed')
  ),
  form_data jsonb not null default '{}'::jsonb
);
create index lrt_lead_requests_campaign_id_idx on public.lrt_lead_requests (campaign_id);
create index lrt_lead_requests_owner_id_idx on public.lrt_lead_requests (owner_id);
create index lrt_lead_requests_status_idx on public.lrt_lead_requests (status);
create index lrt_lead_requests_lead_type_idx on public.lrt_lead_requests (lead_type);
create index lrt_lead_requests_sla_status_idx on public.lrt_lead_requests (sla_status);
create index lrt_lead_requests_created_at_idx on public.lrt_lead_requests (created_at desc);
create index lrt_lead_requests_submitted_by_idx on public.lrt_lead_requests (submitted_by);
create index lrt_lead_requests_campaign_status_idx on public.lrt_lead_requests (campaign_id, status);

-- lrt_sla_configs
create table public.lrt_sla_configs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.lrt_campaigns (id) on delete cascade,
  lead_type text not null check (
    lead_type in (
      'permanent_assignment','business_trip','nlt_new_fiber',
      'market_proposal','oof_wireless','pullback'
    )
  ),
  sla_hours integer not null check (sla_hours > 0),
  warning_hours integer not null check (warning_hours > 0 and warning_hours <= sla_hours),
  updated_by uuid references public.lrt_profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (campaign_id, lead_type)
);
create index lrt_sla_configs_campaign_id_idx on public.lrt_sla_configs (campaign_id);

-- lrt_audit_log
create table public.lrt_audit_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.lrt_lead_requests (id) on delete cascade,
  changed_by uuid not null references public.lrt_profiles (id) on delete restrict,
  changed_at timestamptz not null default now(),
  field_name text,
  old_value text,
  new_value text
);
create index lrt_audit_log_request_id_idx on public.lrt_audit_log (request_id);
create index lrt_audit_log_changed_at_idx on public.lrt_audit_log (changed_at desc);

-- lrt_dmas
create table public.lrt_dmas (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.lrt_campaigns (id) on delete cascade,
  dma_name text not null,
  market text,
  state text,
  is_warning boolean not null default false
);
create index lrt_dmas_campaign_id_idx on public.lrt_dmas (campaign_id);
create index lrt_dmas_dma_name_idx on public.lrt_dmas (dma_name);
create index lrt_dmas_campaign_dma_name_idx on public.lrt_dmas (campaign_id, dma_name);

-- lrt_no_coverage_zips
create table public.lrt_no_coverage_zips (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.lrt_campaigns (id) on delete cascade,
  zip_code text not null,
  city text,
  state text
);
create index lrt_no_coverage_zips_campaign_id_idx on public.lrt_no_coverage_zips (campaign_id);
create index lrt_no_coverage_zips_zip_code_idx on public.lrt_no_coverage_zips (zip_code);
create index lrt_no_coverage_zips_campaign_zip_idx on public.lrt_no_coverage_zips (campaign_id, zip_code);

-- updated_at trigger
create or replace function public.lrt_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger lrt_lead_requests_set_updated_at
before update on public.lrt_lead_requests
for each row execute function public.lrt_set_updated_at();
;
