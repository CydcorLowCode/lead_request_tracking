
-- Reusable function to seed default CSV columns for any campaign
CREATE OR REPLACE FUNCTION seed_default_csv_config(p_campaign TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO campaign_csv_config (campaign, field_key, display_label, source_table, sort_order, field_group) VALUES
    -- Core order info
    (p_campaign, 'bubble_id',                    'Order Record ID',       'orders', 10,  'core'),
    (p_campaign, 'created_at',                   'Created Date',          'orders', 15,  'core'),
    (p_campaign, 'sales_date_date',              'Sales Date',            'orders', 20,  'core'),
    (p_campaign, 'status_option_status',         'Order Status',          'orders', 25,  'core'),
    (p_campaign, 'order_type_text',              'Order Type',            'orders', 30,  'core'),
    (p_campaign, 'customer_type_text',           'Customer Type',         'orders', 35,  'core'),
    (p_campaign, 'tier_level_text',              'Tier Level',            'orders', 40,  'core'),
    -- Customer info
    (p_campaign, 'customer_first_name_text',     'Customer First Name',   'orders', 100, 'customer'),
    (p_campaign, 'customer_last_name_text',      'Customer Last Name',    'orders', 110, 'customer'),
    (p_campaign, 'business_name_text',           'Business Name',         'orders', 120, 'customer'),
    (p_campaign, 'email_text',                   'Customer Email',        'orders', 130, 'customer'),
    (p_campaign, 'phone_number_text',            'Phone Number',          'orders', 140, 'customer'),
    -- Rep info
    (p_campaign, 'full_name_text',               'Sales Rep',             'users',  200, 'rep_info'),
    (p_campaign, 'icl_code_text',                'ICL Code',              'users',  210, 'rep_info'),
    (p_campaign, 'agent_code_text',              'Agent Code',            'campaign_assignments', 220, 'rep_info'),
    (p_campaign, 'ciaa_id__sf__text',            'CIAA ID',              'campaign_assignments', 230, 'rep_info'),
    -- Order IDs
    (p_campaign, 'order_id_text',                'External Order ID',     'orders', 300, 'order_ids'),
    (p_campaign, 'salesforce_id_text',           'Salesforce ID',         'orders', 310, 'order_ids'),
    (p_campaign, 'salesforce_external_reference_number_text', 'SF Reference #', 'orders', 320, 'order_ids')
  ON CONFLICT (campaign, field_key, source_table) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
;
