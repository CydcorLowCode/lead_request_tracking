
CREATE OR REPLACE FUNCTION get_campaign_orders_for_csv(
  p_campaign TEXT,
  p_cutoff_date TIMESTAMPTZ
)
RETURNS TABLE(order_data JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT to_jsonb(sub) FROM (
    SELECT 
      -- Order fields
      o.bubble_id,
      o.created_at,
      o.sales_date_date,
      o.status_option_status,
      o.order_type_text,
      o.customer_type_text,
      o.tier_level_text,
      o.customer_first_name_text,
      o.customer_last_name_text,
      o.business_name_text,
      o.email_text,
      o.phone_number_text,
      o.phone_number__cbr__number,
      o.order_id_text,
      o.salesforce_id_text,
      o.salesforce_external_reference_number_text,
      o.order_attribute__text,
      o.order_attribute_2_text,
      o.order_attribute_3_text,
      o.order_attribute_4_text,
      o.order_attribute_5_text,
      o.package_info_text,
      o.loyalty_program_text,
      o.contains_ars_text,
      o.btn_number,
      o.wireless_ban_text,
      o.external_account_number_text,
      o.external_secondary_order_id_text,
      o.external_uid_text,
      o.external_wireless_order_id_text,
      o.dwelling_type_text,
      o.verification_type_text,
      o.product_1_text,
      o.product_2_text,
      o.product_3_text,
      o.psu_sold_number,
      o.account_id_text,
      o.installation_date_date,
      o.opt_in_boolean,
      o.backend_notes_text,
      o.full_address_geographic_address,
      o.prepaid_text,
      -- User fields (prefixed)
      u.full_name_text AS user_full_name_text,
      u.first_name_text AS user_first_name_text,
      u.last_name_text AS user_last_name_text,
      u.icl_code_text AS user_icl_code_text,
      u.email_text AS user_email_text,
      -- Campaign assignment fields (prefixed)
      ca.agent_code_text AS ca_agent_code_text,
      ca.ciaa_id__sf__text AS ca_ciaa_id__sf__text,
      ca.campaign_option_campaigns AS ca_campaign_option_campaigns,
      ca.rep_function_option_rep_function AS ca_rep_function_option_rep_function,
      -- ICL fields (prefixed)
      icl.sf_account_id_text AS icl_sf_account_id_text,
      icl.country_text AS icl_country_text,
      icl.icl_code_text AS icl_icl_code_text,
      icl.icl_name_text AS icl_icl_name_text,
      -- Product fields (first linked product; prefixed)
      p.display_name_text AS product_display_name_text,
      p.existing_product_text AS product_existing_product_text,
      p.periodic_usage_number AS product_periodic_usage_number,
      p.product_plan_name_text AS product_product_plan_name_text,
      p.product_attribute_1_text AS product_product_attribute_1_text,
      p.product_attribute_2_text AS product_product_attribute_2_text,
      p.quantity_number AS product_quantity_number,
      -- Derived: Campaign Unified Code (resolved via ICL country)
      COALESCE(cuc.sf_campaign_id, 'UNKNOWN') AS derived_campaign_unified_code
    FROM orders o
    LEFT JOIN users u ON u.id = o.sales_rep_uuid
    LEFT JOIN campaign_assignments ca 
      ON ca.bubble_id = REPLACE(o.related_campaign_assignment_custom_campaign_assignment, '1348695171700984260__LOOKUP__', '')
    LEFT JOIN campaign_name_aliases cna ON cna.alias = ca.campaign_option_campaigns
    -- ICL join: through order -> icl FK or through campaign_assignment -> icl
    LEFT JOIN icls icl ON icl.id = o.icl_uuid
    -- Product join: first product from the array
    LEFT JOIN products p ON p.id = (
      SELECT pp.id FROM products pp 
      WHERE pp.order_uuid = o.id 
      LIMIT 1
    )
    -- Campaign Unified Code: resolved by campaign + ICL country
    LEFT JOIN campaign_unified_codes cuc 
      ON cuc.campaign = p_campaign
      AND cuc.country = COALESCE(icl.country_text, 'United States')
    WHERE o.created_at >= p_cutoff_date
      AND (ca.campaign_option_campaigns = p_campaign OR cna.canonical_name = p_campaign)
    ORDER BY o.created_at DESC
  ) sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
;
