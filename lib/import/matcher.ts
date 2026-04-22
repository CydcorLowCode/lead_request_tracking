/**
 * Tiered matching of parsed AT&T rows to existing `lrt_lead_requests` (confirmation, fields, dealer tiebreak).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";
import type { IncomingAttRow, MatchStatus, MatchTier } from "@/types/import";

import { mapAttDecisionToLeadStatus } from "./decision";
import { leadAreasMatch, normalizeLeadArea, normalizeString } from "./normalize";
import { resolveOwnerForNewRow } from "./resolve-owner";

export type MatchResult = {
  match_status: MatchStatus;
  match_tier: MatchTier | null;
  candidate_request_ids: string[];
  linked_request_id: string | null;
  /** When `match_status` is `error`, reason for territory team. */
  error_message?: string | null;
  /** For `new` rows that passed owner resolution. */
  resolved_owner_id?: string | null;
};

export function aggregateLeadAreaFromRequest(row: Tables<"lrt_lead_requests">): string {
  return normalizeLeadArea([
    row.lead_area_requested,
    row.lead_area_requested_2,
    row.lead_area_requested_3,
    row.lead_area_requested_4,
    row.lead_area_requested_5,
  ]);
}

function requestSubmittedDateIso(row: Tables<"lrt_lead_requests">): string {
  if (row.att_submitted_at) {
    return row.att_submitted_at.slice(0, 10);
  }
  return row.created_at.slice(0, 10);
}

function incomingMatchesRequest(incoming: IncomingAttRow, lr: Tables<"lrt_lead_requests">): boolean {
  const area = aggregateLeadAreaFromRequest(lr);
  if (!leadAreasMatch(incoming.lead_area, area)) return false;

  if (normalizeString(incoming.office) !== normalizeString(lr.office ?? "")) return false;
  if (normalizeString(incoming.dealer_code) !== normalizeString(lr.dealer_code ?? "")) return false;
  if (normalizeString(incoming.dma) !== normalizeString(lr.dma ?? "")) return false;
  if (incoming.lead_type !== lr.lead_type) return false;
  if (incoming.submitted_date !== requestSubmittedDateIso(lr)) return false;
  if (mapAttDecisionToLeadStatus(incoming.att_decision) !== lr.status) return false;
  const inc = incoming.att_confirmation_number?.trim() ?? "";
  const cur = lr.att_confirmation_number?.trim() ?? "";
  if (inc !== cur) return false;
  return true;
}

function parseRpcRows(data: unknown): Tables<"lrt_lead_requests">[] {
  if (!Array.isArray(data)) return [];
  return data as Tables<"lrt_lead_requests">[];
}

export async function matchIncomingRow(
  incoming: IncomingAttRow,
  campaignId: string,
  supabase: SupabaseClient<Database>,
): Promise<MatchResult> {
  const empty: MatchResult = {
    match_status: "pending",
    match_tier: null,
    candidate_request_ids: [],
    linked_request_id: null,
  };

  const conf = incoming.att_confirmation_number?.trim() ?? "";

  if (conf !== "") {
    const { data: byConf, error: e1 } = await supabase
      .from("lrt_lead_requests")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("att_confirmation_number", conf);

    if (e1) {
      return { ...empty, match_status: "error", error_message: e1.message };
    }

    const tier1 = byConf ?? [];
    if (tier1.length === 1) {
      const row = tier1[0]!;
      const same = incomingMatchesRequest(incoming, row);
      return {
        match_status: same ? "unchanged" : "matched",
        match_tier: "tier_1_confirmation_id",
        candidate_request_ids: [row.id],
        linked_request_id: row.id,
      };
    }
    if (tier1.length > 1) {
      console.warn(
        `[lrt import] duplicate att_confirmation_number=${conf} campaign=${campaignId} (${tier1.length} rows); falling back to field match`,
      );
    }
  }

  const sub = incoming.submitted_date;
  const lo = addDaysIso(sub, -3);
  const hi = addDaysIso(sub, 3);

  const { data: rpcData, error: rpcErr } = await supabase.rpc("lrt_import_match_candidates", {
    p_campaign_id: campaignId,
    p_office_norm: normalizeString(incoming.office),
    p_lead_type: incoming.lead_type,
    p_date_lo: lo,
    p_date_hi: hi,
  });

  if (rpcErr) {
    return { ...empty, match_status: "error", error_message: rpcErr.message };
  }

  const candidates = parseRpcRows(rpcData).filter((row) =>
    leadAreasMatch(incoming.lead_area, aggregateLeadAreaFromRequest(row)),
  );

  const hasConf = conf !== "";
  const fieldTier: MatchTier = hasConf ? "tier_3_backfill" : "tier_2_fields";

  const preTiebreakIds = candidates.map((c) => c.id);

  if (candidates.length === 0) {
    const ownerRes = await resolveOwnerForNewRow(supabase, campaignId, incoming);
    if ("errorMessage" in ownerRes) {
      return {
        ...empty,
        match_status: "error",
        match_tier: fieldTier,
        error_message: ownerRes.errorMessage,
      };
    }
    return {
      ...empty,
      match_status: "new",
      match_tier: fieldTier,
      resolved_owner_id: ownerRes.ownerId,
    };
  }

  if (candidates.length === 1) {
    const row = candidates[0]!;
    const same = incomingMatchesRequest(incoming, row);
    return {
      match_status: same ? "unchanged" : "matched",
      match_tier: fieldTier,
      candidate_request_ids: [row.id],
      linked_request_id: row.id,
    };
  }

  const dNorm = normalizeString(incoming.dealer_code);
  const afterDealer = candidates.filter(
    (c) => normalizeString(c.dealer_code ?? "") === dNorm,
  );

  if (afterDealer.length === 1) {
    const row = afterDealer[0]!;
    const same = incomingMatchesRequest(incoming, row);
    return {
      match_status: same ? "unchanged" : "matched",
      match_tier: "tier_dealer_tiebreak",
      candidate_request_ids: [row.id],
      linked_request_id: row.id,
    };
  }

  return {
    match_status: "ambiguous_unresolved",
    match_tier: fieldTier,
    candidate_request_ids: preTiebreakIds,
    linked_request_id: null,
  };
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
