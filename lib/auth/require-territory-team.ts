/**
 * Server-only guard for routes that require an active territory team `lrt_profiles` row.
 */
import type { Tables } from "@/types/database";

import { createClient } from "@/lib/supabase/server";

import { getSessionContext } from "./get-session-user";

export type TerritoryTeamContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Tables<"lrt_profiles">;
};

export async function requireTerritoryTeam(): Promise<
  TerritoryTeamContext | { error: string }
> {
  const ctx = await getSessionContext();
  if (!ctx) {
    return { error: "You must be signed in." };
  }
  if (ctx.profile.role !== "territory_team") {
    return { error: "Only territory team members can perform this action." };
  }
  const supabase = await createClient();
  return { supabase, profile: ctx.profile };
}
