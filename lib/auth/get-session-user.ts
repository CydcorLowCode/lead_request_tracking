import { createClient } from "@/lib/supabase/server";
import type { LrtProfileRole, Tables } from "@/types/database";

export type LrtProfile = Tables<"lrt_profiles">;

export type SessionContext = {
  authUserId: string;
  profile: LrtProfile;
  campaignIds: string[];
  isTerritoryTeam: boolean;
};

/**
 * Resolves the signed-in Supabase Auth user to `lrt_profiles` and campaign memberships.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("lrt_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  if (!profile.is_active) {
    return null;
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("lrt_user_campaigns")
    .select("campaign_id")
    .eq("user_id", profile.id);

  if (membershipError) {
    // Non-blocking fallback: memberships can be temporarily unavailable.
  }

  const campaignIds = membershipError ? [] : (memberships ?? []).map((m) => m.campaign_id);
  const isTerritoryTeam = profile.role === "territory_team";

  return {
    authUserId: user.id,
    profile,
    campaignIds,
    isTerritoryTeam,
  };
}

export function isTerritoryTeamRole(role: LrtProfileRole): boolean {
  return role === "territory_team";
}
