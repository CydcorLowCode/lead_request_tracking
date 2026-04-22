/**
 * Builds `commit_payload` JSON for `commit_att_import` from import row snapshots and live lead requests.
 */
import type { Tables, TablesInsert } from "@/types/database";
import { mapAttDecisionToLeadStatus } from "./decision";
import { normalizeString } from "./normalize";

export type CommitPayload =
  | {
      op: "update";
      request_id: string;
      patch: Record<string, string | boolean | null>;
      audit: { field_name: string; old_value: string | null; new_value: string | null }[];
    }
  | {
      op: "insert";
      values: TablesInsert<"lrt_lead_requests">;
      audit: { field_name: string; old_value: string | null; new_value: string | null }[];
    };

function norm(s: string | null | undefined): string {
  return normalizeString(s ?? "");
}

export function buildUpdatePayload(
  incoming: {
    office: string | null;
    dealer_code: string | null;
    dma: string | null;
    lead_area: string | null;
    lead_type: string | null;
    submitted_date: string | null;
    att_confirmation_number: string | null;
    att_decision: string | null;
  },
  existing: Tables<"lrt_lead_requests">,
): CommitPayload | null {
  const patch: Record<string, string | boolean | null> = {};
  const audit: { field_name: string; old_value: string | null; new_value: string | null }[] =
    [];

  const nextOffice = incoming.office?.trim() ? incoming.office.trim() : null;
  if ((existing.office ?? null) !== nextOffice) {
    patch.office = nextOffice;
    audit.push({
      field_name: "office",
      old_value: existing.office,
      new_value: nextOffice,
    });
  }

  const nextDealer = incoming.dealer_code?.trim() ? incoming.dealer_code.trim() : null;
  if ((existing.dealer_code ?? null) !== nextDealer) {
    patch.dealer_code = nextDealer;
    audit.push({
      field_name: "dealer_code",
      old_value: existing.dealer_code,
      new_value: nextDealer,
    });
  }

  const nextDma = incoming.dma?.trim() ? incoming.dma.trim() : null;
  if ((existing.dma ?? null) !== nextDma) {
    patch.dma = nextDma;
    audit.push({ field_name: "dma", old_value: existing.dma, new_value: nextDma });
  }

  const nextLeadArea = incoming.lead_area?.trim() ?? "";
  if (norm(nextLeadArea) !== norm(existing.lead_area_requested)) {
    patch.lead_area_requested = nextLeadArea;
    audit.push({
      field_name: "lead_area_requested",
      old_value: existing.lead_area_requested,
      new_value: nextLeadArea,
    });
  }

  const nextStatus = mapAttDecisionToLeadStatus(incoming.att_decision ?? "");
  if (nextStatus !== existing.status) {
    patch.status = nextStatus;
    audit.push({
      field_name: "status",
      old_value: existing.status,
      new_value: nextStatus,
    });
  }

  const submittedIso =
    incoming.submitted_date && incoming.submitted_date.length >= 10
      ? `${incoming.submitted_date.slice(0, 10)}T12:00:00.000Z`
      : null;
  const prevAtt = existing.att_submitted_at;
  if (submittedIso !== (prevAtt ?? null)) {
    patch.att_submitted_at = submittedIso;
    audit.push({
      field_name: "att_submitted_at",
      old_value: prevAtt,
      new_value: submittedIso,
    });
  }

  const nextConf = incoming.att_confirmation_number?.trim() ?? "";
  const prevConf = existing.att_confirmation_number?.trim() ?? "";
  if (nextConf !== prevConf) {
    const nv = nextConf === "" ? null : nextConf;
    patch.att_confirmation_number = nv;
    audit.push({
      field_name: "att_confirmation_number",
      old_value: prevConf === "" ? null : prevConf,
      new_value: nv,
    });
  }

  if (incoming.lead_type && incoming.lead_type !== existing.lead_type) {
    patch.lead_type = incoming.lead_type;
    audit.push({
      field_name: "lead_type",
      old_value: existing.lead_type,
      new_value: incoming.lead_type,
    });
  }

  if (Object.keys(patch).length === 0) return null;

  return {
    op: "update",
    request_id: existing.id,
    patch,
    audit,
  };
}

export function buildInsertPayload(
  incoming: {
    office: string | null;
    dealer_code: string | null;
    dma: string | null;
    lead_area: string | null;
    lead_type: string | null;
    submitted_date: string | null;
    att_confirmation_number: string | null;
    att_decision: string | null;
  },
  ownerId: string,
  submittedBy: string,
  campaignId: string,
): CommitPayload {
  const submittedIso = `${incoming.submitted_date!.slice(0, 10)}T12:00:00.000Z`;
  const status = mapAttDecisionToLeadStatus(incoming.att_decision ?? "");

  const values: TablesInsert<"lrt_lead_requests"> = {
    campaign_id: campaignId,
    owner_id: ownerId,
    submitted_by: submittedBy,
    submitted_on_behalf: true,
    admin_submitted: true,
    admin_submitted_by: submittedBy,
    admin_submitted_at: submittedIso,
    created_at: submittedIso,
    lead_type: incoming.lead_type!,
    area_type: "market",
    lead_area_requested: incoming.lead_area?.trim() ?? "",
    office: incoming.office?.trim() || null,
    dealer_code: incoming.dealer_code?.trim() || null,
    dma: incoming.dma?.trim() || null,
    status,
    att_submitted_at: submittedIso,
    att_confirmation_number: incoming.att_confirmation_number?.trim()
      ? incoming.att_confirmation_number.trim()
      : null,
    form_data: {},
    sla_status: "on_track",
    is_reserve: false,
  };

  const audit: { field_name: string; old_value: string | null; new_value: string | null }[] =
    [
      { field_name: "campaign_id", old_value: null, new_value: campaignId },
      { field_name: "owner_id", old_value: null, new_value: ownerId },
      { field_name: "status", old_value: null, new_value: status },
      { field_name: "lead_area_requested", old_value: null, new_value: values.lead_area_requested },
    ];

  return { op: "insert", values, audit };
}
