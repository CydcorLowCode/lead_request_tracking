import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { LrtProfileRole, Tables } from "@/types/database";

export type LrtProfile = Tables<"lrt_profiles">;

export type SessionContext = {
  authUserId: string;
  profile: LrtProfile;
  isTerritoryTeam: boolean;
};

/**
 * Resolves the signed-in Supabase Auth user to `lrt_profiles`.
 * Memoized per request via React `cache()`.
 */
export const getSessionContext = cache(
  async (): Promise<SessionContext | null> => {
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

    const isTerritoryTeam = profile.role === "territory_team";

    return {
      authUserId: user.id,
      profile,
      isTerritoryTeam,
    };
  },
);

export function isTerritoryTeamRole(role: LrtProfileRole): boolean {
  return role === "territory_team";
}
