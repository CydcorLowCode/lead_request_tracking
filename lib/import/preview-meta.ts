/**
 * Preview-only field diff + status transition for import rows (mirrors commit payload builders).
 */
import type { RowPreviewMeta } from "@/types/import";
import type { Tables } from "@/types/database";

import { mapAttDecisionToLeadStatus } from "./decision";
import { buildInsertPayload, buildUpdatePayload } from "./commit-payload";

function incomingFromRow(row: Tables<"lrt_import_rows">) {
  return {
    office: row.office,
    dealer_code: row.dealer_code,
    dma: row.dma,
    lead_area: row.lead_area,
    lead_type: row.lead_type,
    submitted_date: row.submitted_date,
    att_confirmation_number: row.att_confirmation_number,
    att_decision: row.att_decision,
  };
}

export function computeRowPreviewMeta(
  row: Tables<"lrt_import_rows">,
  linked: Tables<"lrt_lead_requests"> | null,
  campaignId: string,
  ttProfileId: string,
): RowPreviewMeta {
  const nextStatus = mapAttDecisionToLeadStatus(row.att_decision ?? "");

  if (
    row.match_status === "ambiguous_unresolved" ||
    row.match_status === "error" ||
    row.match_status === "ambiguous_deleted" ||
    row.match_status === "error_deleted" ||
    row.match_status === "pending"
  ) {
    return {
      field_count: 0,
      field_names: [],
      prev_status: null,
      next_status: nextStatus,
      status_will_change: false,
    };
  }

  if (row.match_status === "new" && row.resolved_owner_id) {
    const incoming = incomingFromRow(row);
    const payload = buildInsertPayload(incoming, row.resolved_owner_id, ttProfileId, campaignId);
    const names = payload.audit.map((a) => a.field_name).filter(Boolean);
    return {
      field_count: names.length,
      field_names: names,
      prev_status: null,
      next_status: nextStatus,
      status_will_change: true,
    };
  }

  if (
    linked &&
    (row.match_status === "matched" ||
      row.match_status === "unchanged" ||
      row.match_status === "ambiguous_resolved" ||
      row.match_status === "applied")
  ) {
    const incoming = incomingFromRow(row);
    const payload = buildUpdatePayload(incoming, linked);
    if (!payload) {
      return {
        field_count: 0,
        field_names: [],
        prev_status: linked.status,
        next_status: nextStatus,
        status_will_change: nextStatus !== linked.status,
      };
    }
    const names = payload.audit.map((a) => a.field_name).filter(Boolean);
    return {
      field_count: names.length,
      field_names: names,
      prev_status: linked.status,
      next_status: nextStatus,
      status_will_change: nextStatus !== linked.status,
    };
  }

  return {
    field_count: 0,
    field_names: [],
    prev_status: linked?.status ?? null,
    next_status: nextStatus,
    status_will_change: false,
  };
}
