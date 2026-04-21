
CREATE OR REPLACE FUNCTION get_campaign_orders_for_csv(
  p_campaign TEXT,
  p_cutoff_date TIMESTAMPTZ
)
RETURNS TABLE(order_data JSONB) AS $$
BEGIN
  RETURN QUERY
  WITH campaign_codes AS (
    -- Pre-fetch the unified codes once
    SELECT lc.value, lc.campaign_unified_code 
    FROM lookup_campaigns lc 
    WHERE lc.value IN (p_campaign, p_campaign || '_canada')
  ),
  first_products AS (
    -- Deduplicate: pick one product per order using DISTINCT ON
    SELECT DISTINCT ON (pp.order_uuid)
      pp.order_uuid,
      pp.display_name_text,
      pp.existing_product_text,
      pp.periodic_usage_number,
      pp.product_plan_name_text,
      pp.product_attribute_1_text,
      pp.product_attribute_2_text,
      pp.quantity_number
    FROM products pp
    WHERE pp.order_uuid IS NOT NULL
    ORDER BY pp.order_uuid, pp.created_at ASC
  )
  SELECT to_jsonb(sub) FROM (
    SELECT 
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
      u.full_name_text AS user_full_name_text,
      u.first_name_text AS user_first_name_text,
      u.last_name_text AS user_last_name_text,
      u.icl_code_text AS user_icl_code_text,
      u.email_text AS user_email_text,
      ca.agent_code_text AS ca_agent_code_text,
      ca.ciaa_id__sf__text AS ca_ciaa_id__sf__text,
      ca.campaign_option_campaigns AS ca_campaign_option_campaigns,
      ca.rep_function_option_rep_function AS ca_rep_function_option_rep_function,
      icl.sf_account_id_text AS icl_sf_account_id_text,
      icl.country_text AS icl_country_text,
      icl.icl_code_text AS icl_icl_code_text,
      icl.icl_name_text AS icl_icl_name_text,
      fp.display_name_text AS product_display_name_text,
      fp.existing_product_text AS product_existing_product_text,
      fp.periodic_usage_number AS product_periodic_usage_number,
      fp.product_plan_name_text AS product_product_plan_name_text,
      fp.product_attribute_1_text AS product_product_attribute_1_text,
      fp.product_attribute_2_text AS product_product_attribute_2_text,
      fp.quantity_number AS product_quantity_number,
      COALESCE(
        CASE 
          WHEN p_campaign = 'amazon_business' AND icl.country_text = 'Canada'
            THEN (SELECT cc.campaign_unified_code FROM campaign_codes cc WHERE cc.value = 'amazon_business_canada')
          ELSE (SELECT cc.campaign_unified_code FROM campaign_codes cc WHERE cc.value = p_campaign)
        END,
        'UNKNOWN'
      ) AS derived_campaign_unified_code
    FROM orders o
    LEFT JOIN users u ON u.id = o.sales_rep_uuid
    LEFT JOIN campaign_assignments ca ON ca.id = o.campaign_assignment_uuid
    LEFT JOIN campaign_name_aliases cna ON cna.alias = ca.campaign_option_campaigns
    LEFT JOIN icls icl ON icl.id = o.icl_uuid
    LEFT JOIN first_products fp ON fp.order_uuid = o.id
    WHERE o.created_at >= p_cutoff_date
      AND (ca.campaign_option_campaigns = p_campaign OR cna.canonical_name = p_campaign)
    ORDER BY o.created_at DESC
  ) sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
;
