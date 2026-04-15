import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

import { resolveCampaignIdBySlug } from "./resolve-campaign-id";
import { ATT_CAMPAIGN_SLUG } from "./constants";

export type ActiveCampaignsResult = {
  campaigns: Tables<"lrt_campaigns">[];
  attCampaignId: string | null;
};

/**
 * Territory team: all active campaigns. Owners: campaigns they are joined to via `lrt_user_campaigns`.
 */
export async function getActiveCampaignsForSession(
  supabase: SupabaseClient<Database>,
  options: { isTerritoryTeam: boolean; campaignIds: string[] },
): Promise<ActiveCampaignsResult> {
  const { isTerritoryTeam, campaignIds } = options;

  const base = supabase
    .from("lrt_campaigns")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const { data: campaigns, error } = isTerritoryTeam
    ? await base
    : campaignIds.length === 0
      ? { data: [] as Tables<"lrt_campaigns">[], error: null }
      : await base.in("id", campaignIds);

  if (error || !campaigns) {
    return { campaigns: [], attCampaignId: null };
  }

  const attCampaignId = await resolveCampaignIdBySlug(
    supabase,
    ATT_CAMPAIGN_SLUG,
  );

  return { campaigns, attCampaignId };
}
