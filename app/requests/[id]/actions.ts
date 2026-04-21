"use server";

import { appendAuditLog } from "@/lib/audit/append-audit-log";
import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import type { LeadRequestStatus } from "@/types/enums";
import { LEAD_REQUEST_STATUSES } from "@/types/enums";

export type UpdateLeadRequestInput = {
  requestId: string;
  status: string;
  attConfirmationNumber: string;
  attResponseNotes: string;
  internalNotes: string;
  notesForIcl: string;
  approvedZipCodes: string;
  deniedZipCodes: string;
};

export type UpdateLeadRequestResult = {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
};

export type DeleteLeadRequestResult = {
  ok: boolean;
  message?: string;
};

function toValidStatus(value: string): LeadRequestStatus | null {
  if ((LEAD_REQUEST_STATUSES as readonly string[]).includes(value)) {
    return value as LeadRequestStatus;
  }
  return null;
}

export async function updateLeadRequestAction(
  input: UpdateLeadRequestInput,
): Promise<UpdateLeadRequestResult> {
  const ctx = await getSessionContext();
  if (!ctx) return { ok: false, message: "You must be signed in." };

  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("lrt_lead_requests")
    .select(
      "owner_id, status, att_confirmation_number, att_response_at, internal_notes, notes_for_icl, approved_zip_codes, denied_zip_codes",
    )
    .eq("id", input.requestId)
    .maybeSingle();

  if (fetchError || !current) {
    return { ok: false, message: "Request not found." };
  }

  const isOwnerOfRequest =
    ctx.profile.role === "owner" && current.owner_id === ctx.profile.id;

  if (!isOwnerOfRequest && ctx.profile.role !== "territory_team") {
    return { ok: false, message: "You do not have permission to update this request." };
  }

  if (isOwnerOfRequest) {
    const now = new Date().toISOString();
    const newNotesForIcl = input.notesForIcl.trim() || null;
    if (current.notes_for_icl === newNotesForIcl) {
      return { ok: true };
    }

    const { error: updateError } = await supabase
      .from("lrt_lead_requests")
      .update({
        notes_for_icl: newNotesForIcl,
        updated_at: now,
      })
      .eq("id", input.requestId)
      .eq("owner_id", ctx.profile.id);

    if (updateError) return { ok: false, message: updateError.message };

    const { error: auditError } = await appendAuditLog(supabase, {
      requestId: input.requestId,
      fieldName: "notes_for_icl",
      oldValue: current.notes_for_icl,
      newValue: newNotesForIcl,
    });
    if (auditError) {
      return { ok: false, message: "Saved, but failed to write the audit log entry." };
    }
    return { ok: true };
  }

  const newStatus = toValidStatus(input.status);
  if (!newStatus) {
    return { ok: false, errors: { status: "Invalid status value." } };
  }

  const now = new Date().toISOString();
  const terminalStatuses: LeadRequestStatus[] = [
    "visible_in_salesforce", "declined", "leads_pulled_back", "market_proposal_answered",
  ];
  const attResponseAt =
    current.att_response_at ??
    (terminalStatuses.includes(newStatus) ? now : null);

  const { error: updateError } = await supabase
    .from("lrt_lead_requests")
    .update({
      status: newStatus,
      att_confirmation_number: input.attConfirmationNumber.trim() || null,
      att_response_at: attResponseAt,
      internal_notes: input.internalNotes.trim() || null,
      notes_for_icl: input.notesForIcl.trim() || null,
      approved_zip_codes: input.approvedZipCodes.trim() || null,
      denied_zip_codes: input.deniedZipCodes.trim() || null,
      updated_at: now,
    })
    .eq("id", input.requestId);

  if (updateError) return { ok: false, message: updateError.message };

  const auditPromises: Promise<unknown>[] = [];

  if (current.status !== newStatus) {
    auditPromises.push(
      appendAuditLog(supabase, {
        requestId: input.requestId,
        fieldName: "status",
        oldValue: current.status,
        newValue: newStatus,
      }),
    );
  }

  const newConfNum = input.attConfirmationNumber.trim() || null;
  if (current.att_confirmation_number !== newConfNum) {
    auditPromises.push(
      appendAuditLog(supabase, {
        requestId: input.requestId,
        fieldName: "att_confirmation_number",
        oldValue: current.att_confirmation_number,
        newValue: newConfNum,
      }),
    );
  }

  const newApprovedZips = input.approvedZipCodes.trim() || null;
  if (current.approved_zip_codes !== newApprovedZips) {
    auditPromises.push(
      appendAuditLog(supabase, {
        requestId: input.requestId,
        fieldName: "approved_zip_codes",
        oldValue: current.approved_zip_codes,
        newValue: newApprovedZips,
      }),
    );
  }

  const newDeniedZips = input.deniedZipCodes.trim() || null;
  if (current.denied_zip_codes !== newDeniedZips) {
    auditPromises.push(
      appendAuditLog(supabase, {
        requestId: input.requestId,
        fieldName: "denied_zip_codes",
        oldValue: current.denied_zip_codes,
        newValue: newDeniedZips,
      }),
    );
  }

  await Promise.all(auditPromises);
  return { ok: true };
}

export async function deleteLeadRequestAction(
  requestId: string,
): Promise<DeleteLeadRequestResult> {
  const ctx = await getSessionContext();
  if (!ctx) {
    return { ok: false, message: "You must be signed in." };
  }

  const id = requestId.trim();
  if (!id) {
    return { ok: false, message: "Invalid request." };
  }

  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("lrt_lead_requests")
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row) {
    return { ok: false, message: "Request not found." };
  }

  const isOwner = ctx.profile.role === "owner" && row.owner_id === ctx.profile.id;
  const isTerritoryTeam = ctx.profile.role === "territory_team";

  if (!isOwner && !isTerritoryTeam) {
    return { ok: false, message: "You do not have permission to delete this request." };
  }

  const { error: deleteError } = await supabase.from("lrt_lead_requests").delete().eq("id", id);

  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  return { ok: true };
}
