import { describe, expect, it, vi } from "vitest";

import type { Database, Tables } from "@/types/database";
import type { IncomingAttRow } from "@/types/import";
import type { SupabaseClient } from "@supabase/supabase-js";

import { matchIncomingRow } from "./matcher";

function baseIncoming(over: Partial<IncomingAttRow> = {}): IncomingAttRow {
  return {
    office: "Austin Office",
    dealer_code: "d1",
    dma: "Austin",
    lead_type: "nlt_new_fiber",
    lead_area: "78701",
    submitted_date: "2025-01-15",
    att_confirmation_number: null,
    att_decision: "APPROVED",
    sheet_row_index: 2,
    raw_row: {},
    ...over,
  };
}

function mockLeadRequest(
  id: string,
  over: Partial<Tables<"lrt_lead_requests">> = {},
): Tables<"lrt_lead_requests"> {
  return {
    id,
    created_at: "2025-01-15T12:00:00.000Z",
    updated_at: "2025-01-15T12:00:00.000Z",
    campaign_id: "camp",
    owner_id: "o1",
    submitted_by: "s1",
    submitted_on_behalf: false,
    lead_type: "nlt_new_fiber",
    area_type: "market",
    lead_area_requested: "78701",
    lead_area_requested_2: null,
    lead_area_requested_3: null,
    lead_area_requested_4: null,
    lead_area_requested_5: null,
    date_needed_by: null,
    headcount: null,
    notes: null,
    is_reserve: false,
    dealer_code: "d1",
    dma: "austin",
    office: "austin office",
    status: "leads_received",
    att_confirmation_number: null,
    att_submitted_at: "2025-01-15T12:00:00.000Z",
    att_response_at: null,
    approved_zip_codes: null,
    denied_zip_codes: null,
    internal_notes: null,
    notes_for_icl: null,
    sf_visibility_date: null,
    decline_date: null,
    resolved_at: null,
    sla_due_at: null,
    sla_status: "on_track",
    form_data: {},
    admin_submitted: false,
    admin_submitted_at: null,
    admin_submitted_by: null,
    ...over,
  };
}

function createClientMock(opts: { tier1?: Tables<"lrt_lead_requests">[]; rpc?: Tables<"lrt_lead_requests">[] }): SupabaseClient<Database> {
  const rpc = vi.fn(async (fn: string) => {
    expect(fn).toBe("lrt_import_match_candidates");
    return { data: opts.rpc ?? [], error: null };
  });

  const from = vi.fn((table: string) => {
    if (table === "lrt_lead_requests") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: opts.tier1 ?? [], error: null }),
          }),
        }),
      };
    }
    if (table === "lrt_user_campaigns") {
      return {
        select: () => ({
          eq: () =>
            Promise.resolve({
              data: [{ profile_id: "p1" }],
              error: null,
            }),
        }),
      };
    }
    if (table === "lrt_profiles") {
      return {
        select: () => ({
          in: () => ({
            eq: () => ({
              eq: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "p1",
                      office_name: "austin office",
                      dealer_code: "d1",
                      role: "owner",
                      is_active: true,
                    },
                  ],
                  error: null,
                }),
            }),
          }),
        }),
      };
    }
    return {};
  });

  return { from, rpc } as unknown as SupabaseClient<Database>;
}

describe("matchIncomingRow", () => {
  it("tier 1: single confirmation → unchanged", async () => {
    const row = mockLeadRequest("a1", {
      att_confirmation_number: "CONF1",
    });
    const client = createClientMock({
      tier1: [row],
    });
    const incoming = baseIncoming({
      att_confirmation_number: "CONF1",
      att_decision: "APPROVED",
    });
    const res = await matchIncomingRow(incoming, "camp", client);
    expect(res.match_tier).toBe("tier_1_confirmation_id");
    expect(res.match_status).toBe("unchanged");
    expect(res.linked_request_id).toBe("a1");
  });

  it("tier 2: field match via RPC → unchanged", async () => {
    const row = mockLeadRequest("b1");
    const client = createClientMock({
      tier1: [],
      rpc: [row],
    });
    const incoming = baseIncoming({ att_confirmation_number: null });
    const res = await matchIncomingRow(incoming, "camp", client);
    expect(res.match_tier).toBe("tier_2_fields");
    expect(res.match_status).toBe("unchanged");
    expect(res.linked_request_id).toBe("b1");
  });

  it("ambiguous when multiple candidates and dealer tiebreak fails", async () => {
    const r1 = mockLeadRequest("c1", { dealer_code: "x" });
    const r2 = mockLeadRequest("c2", { dealer_code: "y" });
    const client = createClientMock({
      tier1: [],
      rpc: [r1, r2],
    });
    const incoming = baseIncoming({ dealer_code: "d1" });
    const res = await matchIncomingRow(incoming, "camp", client);
    expect(res.match_status).toBe("ambiguous_unresolved");
    expect(res.candidate_request_ids.sort()).toEqual(["c1", "c2"].sort());
  });

  it("dealer tiebreak narrows to one", async () => {
    const r1 = mockLeadRequest("d1", { dealer_code: "d1" });
    const r2 = mockLeadRequest("d2", { dealer_code: "d2" });
    const client = createClientMock({
      tier1: [],
      rpc: [r1, r2],
    });
    const incoming = baseIncoming({ dealer_code: "D1" });
    const res = await matchIncomingRow(incoming, "camp", client);
    expect(res.match_tier).toBe("tier_dealer_tiebreak");
    expect(res.linked_request_id).toBe("d1");
  });
});
