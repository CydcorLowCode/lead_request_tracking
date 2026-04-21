
-- RPC: get distinct campaigns with orders in the lookback window
-- Used by the edge function to auto-detect which campaigns need CSVs
CREATE OR REPLACE FUNCTION get_active_order_campaigns(cutoff_date TIMESTAMPTZ)
RETURNS TABLE(campaign TEXT, order_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(cna.canonical_name, ca.campaign_option_campaigns) AS campaign,
    COUNT(*) AS order_count
  FROM orders o
  LEFT JOIN campaign_assignments ca ON ca.id = o.campaign_assignment_uuid
  LEFT JOIN campaign_name_aliases cna ON cna.alias = ca.campaign_option_campaigns
  WHERE o.created_at >= cutoff_date
    AND ca.campaign_option_campaigns IS NOT NULL
  GROUP BY COALESCE(cna.canonical_name, ca.campaign_option_campaigns)
  ORDER BY order_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
;
