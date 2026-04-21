
-- zip_code_assignments
CREATE TABLE IF NOT EXISTS public.zip_code_assignments (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  name_text text,
  zip_code__number__number numeric,
  state_text text,
  country_text text,
  count_of_leads_number numeric,
  potential_business_count_number numeric,
  population_number numeric,
  square_ft_number numeric,
  status_text text,
  icon_text text,
  owner_text text,
  zip_and_count_text text,
  data_layer_text text,
  source_text text,
  shape_color_text text,
  reprocess_boolean boolean,
  rested_date_date bigint,
  last_activity_date bigint,
  related_territories_list text[],
  assigned_icls_list text[],
  tags_list text[],
  related_zip_code_icl_assignments_list text[],
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- zip_code_icl_assignments
CREATE TABLE IF NOT EXISTS public.zip_code_icl_assignments (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  name_text text,
  status_option_zip_code_assignment_status text,
  icl_custom_icl text,
  shared_icl_custom_icl text,
  zip_code_custom_zip_code_assignments text,
  assigned_date_date bigint,
  rested_date_date bigint,
  leads_imported_date bigint,
  last_worked__date bigint,
  related_territories_list text[],
  shared_icls_list text[],
  tags_list text[],
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- surveys
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  first_name_text text,
  last_name_text text,
  full_name_text text,
  business_name_text text,
  email_text text,
  phone_text text,
  status_text text,
  source_text text,
  client_option_campaigns text,
  program_text text,
  language_text text,
  industry_text text,
  url_text text,
  ip_address_text text,
  opt_in_text text,
  additional_info_text text,
  rate_your_experience_number numeric,
  how_likely_are_you_to_use_cmb_again_number numeric,
  employee_count_number numeric,
  number_of_locations_number numeric,
  years_in_business_number numeric,
  current_question_number numeric,
  revenue_text text,
  employee_count_2025_text text,
  google_business_review_boolean boolean,
  facebook_business_review_boolean boolean,
  same_day_completion_boolean boolean,
  completion_date_date bigint,
  order_s_sales_date_date bigint,
  sales_rep_name_text text,
  business_services1_list text[],
  related_order_custom_orders text,
  related_parent_lead_custom_parent_lead text,
  sales_rep_user text,
  icl_custom_icl text,
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- territory_snapshots
CREATE TABLE IF NOT EXISTS public.territory_snapshots (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  related_territory_custom_territory text,
  related_zip_code_assignment_custom_zip_code_icl__assignments text,
  related_zip_code_custom_zip_code_assignments text,
  assigned_icl_custom_icl text,
  sales_rep_user text,
  primary_rep_user text,
  secondary_rep_user text,
  shared_rep_user text,
  shared_rep1_user text,
  shared_rep2_user text,
  shared_rep3_user text,
  previous_rep1_user text,
  previous_rep2_user text,
  snapshot_status_option_user_status text,
  count_of_total_leads_number numeric,
  count_of_leads_worked_number numeric,
  count_of_unworked_leads_number numeric,
  count_of_dms_number numeric,
  count_of_warm_dms_number numeric,
  count_of_sales_number numeric,
  count_of_existing_customers_number numeric,
  count_of_invalid_leads_number numeric,
  count_of_locked_doors_number numeric,
  count_of_mdus_number numeric,
  count_of_leads_in_mdu_number numeric,
  count_of_days_worked_number numeric,
  primary_rep___days_worked_number numeric,
  secondary_rep___days_worked_number numeric,
  shared_rep2___days_worked_number numeric,
  shared_rep3___days_worked_number numeric,
  previous_rep1___days_worked_number numeric,
  previous_rep2___days_worked_number numeric,
  avg_loops_to_dm_number numeric,
  upcoming_calendar_events_number numeric,
  date_of_first_worked_date bigint,
  date_of_last_worked_date bigint,
  last_refreshed_date_date bigint,
  refreshed_date_list bigint[],
  reps_list text[],
  tags_list text[],
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- contacts (referrals)
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  name_text text,
  name__full__text text,
  last_name_text text,
  email_text text,
  phone1_number numeric,
  status_option_status text,
  outcome_option_referral_outcome text,
  program_text text,
  time_zone_text text,
  requested_contact_time_text text,
  created_by_text text,
  opted_in_boolean boolean,
  opt_in_date_date bigint,
  referral_date_date bigint,
  last_contact_date_date bigint,
  phone_call_count_number numeric,
  days_of_week_list text[],
  contacted_dates_list bigint[],
  notes_list text[],
  related_notes_list text[],
  sales_rep_user text,
  originating_icl_custom_icl text,
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- mdus
CREATE TABLE IF NOT EXISTS public.mdus (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  complex_name_text text,
  contact_name_text text,
  full_address_text_text text,
  street___text text,
  street_name_text text,
  city_text text,
  state_province_text text,
  zip_postal_code_text text,
  latitude_number numeric,
  longitude_number numeric,
  property_type_option_property_type text,
  status_option_status text,
  created_method_text text,
  bulk_processed_boolean boolean,
  related_buildings_list text[],
  related_floors_list text[],
  related_parent_leads_list text[],
  related_territory_custom_territory text,
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- buildings
CREATE TABLE IF NOT EXISTS public.buildings (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  building_name_text text,
  related_mdu_custom_mdu text,
  related_floors_list text[],
  related_parent_leads_list text[],
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- floors
CREATE TABLE IF NOT EXISTS public.floors (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  name_text text,
  floor___option_floor text,
  related_building_custom_building text,
  related_mdu_custom_mdu text,
  related_parent_lead_list text[],
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- session_logs
CREATE TABLE IF NOT EXISTS public.session_logs (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  logs_list text[],
  related_user_user text,
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- campaign_info (order configurations)
CREATE TABLE IF NOT EXISTS public.campaign_info (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  client_option_campaigns text,
  status_option_status text,
  order_type_text text,
  order_id_label_text text,
  default_order_creation_type_text text,
  sales_date_label_text text,
  address_label_text text,
  notes_label_text text,
  -- show/required flags stored as jsonb for compactness
  configuration_flags jsonb DEFAULT '{}'::jsonb,
  -- product/order attribute configs stored as jsonb
  order_attributes jsonb DEFAULT '{}'::jsonb,
  product_categories_list text[],
  related_product_catalog_list text[],
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- product_catalog
CREATE TABLE IF NOT EXISTS public.product_catalog (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  product_name_text text,
  campaign_option_campaigns text,
  sf_id_text text,
  external_product_code_text text,
  generic_product_name_option text,
  product_attribute1_label_text text,
  product_attribute2_label_text text,
  product_catalog_status_option text,
  product_input_show_boolean boolean,
  -- detailed config flags as jsonb
  product_config jsonb DEFAULT '{}'::jsonb,
  product_category1_custom_product_category text,
  related_order_config_custom_campaign_info text,
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- collateral_logs
CREATE TABLE IF NOT EXISTS public.collateral_logs (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  date_date bigint,
  within_log_visit_flow_boolean boolean,
  collateral_accessed_list text[],
  related_parent_lead_custom_parent_lead text,
  rep_user text,
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- product_categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bubble_id text UNIQUE NOT NULL,
  category_text text,
  category_icon_image text,
  campaign_option_campaigns text,
  prevent_duplicate_products_boolean boolean,
  prevent_duplicate_products__same_boolean boolean,
  financed_equipment_required_boolean boolean,
  mtn_max_length_number numeric,
  mtn_required_boolean boolean,
  port_required_boolean boolean,
  related_products_list text[],
  created_at timestamptz,
  modified_at timestamptz,
  created_by text
);

-- Add sync_state entries for all new tables
INSERT INTO public.sync_state (table_name, last_sync_at, sync_status) VALUES
  ('zip_code_assignments', '2025-01-01T00:00:00Z', 'idle'),
  ('zip_code_icl_assignments', '2025-01-01T00:00:00Z', 'idle'),
  ('surveys', '2025-01-01T00:00:00Z', 'idle'),
  ('territory_snapshots', '2025-01-01T00:00:00Z', 'idle'),
  ('contacts', '2025-01-01T00:00:00Z', 'idle'),
  ('mdus', '2025-01-01T00:00:00Z', 'idle'),
  ('buildings', '2025-01-01T00:00:00Z', 'idle'),
  ('floors', '2025-01-01T00:00:00Z', 'idle'),
  ('session_logs', '2025-01-01T00:00:00Z', 'idle'),
  ('campaign_info', '2025-01-01T00:00:00Z', 'idle'),
  ('product_catalog', '2025-01-01T00:00:00Z', 'idle'),
  ('collateral_logs', '2025-01-01T00:00:00Z', 'idle'),
  ('product_categories', '2025-01-01T00:00:00Z', 'idle')
ON CONFLICT (table_name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.zip_code_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zip_code_icl_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mdus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collateral_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
;
