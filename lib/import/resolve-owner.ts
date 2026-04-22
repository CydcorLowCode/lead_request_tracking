/**
 * Resolves a single active owner profile for import rows with no matching lead request (`new`),
 * using normalized office name + dealer code within a campaign.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { IncomingAttRow } from "@/types/import";

import { normalizeString } from "./normalize";

export async function resolveOwnerForNewRow(
  supabase: SupabaseClient<Database>,
  campaignId: string,
  incoming: IncomingAttRow,
): Promise<{ ownerId: string } | { errorMessage: string }> {
  const { data: ucs, error: ucError } = await supabase
    .from("lrt_user_campaigns")
    .select("profile_id")
    .eq("campaign_id", campaignId);

  if (ucError || !ucs?.length) {
    return {
      errorMessage: `Could not resolve owner: 0 active owner profiles match office '${incoming.office}' + dealer '${incoming.dealer_code}' (no campaign access).`,
    };
  }

  const profileIds = [...new Set(ucs.map((u) => u.profile_id))];
  const { data: profiles, error: pError } = await supabase
    .from("lrt_profiles")
    .select("id, office_name, dealer_code, role, is_active")
    .in("id", profileIds)
    .eq("role", "owner")
    .eq("is_active", true);

  if (pError) {
    return {
      errorMessage: `Could not resolve owner: 0 active owner profiles match office '${incoming.office}' + dealer '${incoming.dealer_code}'.`,
    };
  }

  const oNorm = normalizeString(incoming.office);
  const dNorm = normalizeString(incoming.dealer_code);

  const matches =
    profiles?.filter((p) => {
      return (
        normalizeString(p.office_name ?? "") === oNorm &&
        normalizeString(p.dealer_code ?? "") === dNorm
      );
    }) ?? [];

  const n = matches.length;
  const officeEsc = incoming.office.replace(/'/g, "''");
  const dealerEsc = incoming.dealer_code.replace(/'/g, "''");
  if (n !== 1) {
    return {
      errorMessage: `Could not resolve owner: ${n} active owner profiles match office '${officeEsc}' + dealer '${dealerEsc}'.`,
    };
  }

  return { ownerId: matches[0]!.id };
}
