"use server";

import { appendAuditLog } from "@/lib/audit/append-audit-log";
import { buildMsFormUrl } from "@/lib/att-form/build-ms-form-url";
import { getSessionContext } from "@/lib/auth/get-session-user";
import { computeSlaDueAt, pickSlaConfigForLeadType } from "@/lib/sla/compute";
import { createClient } from "@/lib/supabase/server";

type SubmitLeadRequestInput = {
  campaignId: string;
  defaultAreaType: string;
  ownerId: string;
  leadType: string;
  dealerCode: string;
  dma: string;
  state: string;
  requestedLocation: string;
  zipCodes: string;
  dateNeededBy: string;
  isReserve: boolean;
  notes: string;
};

export type SubmitLeadRequestResult =
  | { ok: true; requestId: string; redirectTo?: string; msFormUrl?: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

export type MarkRequestSubmittedResult = { ok: boolean; message?: string };

function required(value: string) {
  return value.trim().length > 0;
}

export async function submitLeadRequestAction(
  input: SubmitLeadRequestInput,
): Promise<SubmitLeadRequestResult> {
  const ctx = await getSessionContext();
  if (!ctx) {
    return { ok: false, message: "You must be signed in to submit requests." };
  }

  if (ctx.profile.role !== "owner" && ctx.profile.role !== "territory_team") {
    return { ok: false, message: "Your account cannot submit lead requests." };
  }

  const normalizedOwnerId =
    ctx.profile.role === "owner" ? ctx.profile.id : input.ownerId;

  const errors: Record<string, string> = {};
  if (!required(input.leadType)) {
    errors.leadType = "Lead type is required.";
  }
  if (!required(normalizedOwnerId)) {
    errors.ownerId = "Office is required.";
  }
  if (!required(input.dealerCode)) {
    errors.dealerCode = "Dealer code is required.";
  }
  if (!required(input.dma)) {
    errors.dma = "DMA is required.";
  }
  if (!required(input.requestedLocation)) {
    errors.requestedLocation = "Lead area requested is required.";
  }
  if (!required(input.dateNeededBy)) {
    errors.dateNeededBy = "Date needed by is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const supabase = await createClient();
  const { data: ownerProfile, error: ownerError } = await supabase
    .from("lrt_profiles")
    .select("id, full_name, email, role, is_active, phone, office_name, legal_corp_name")
    .eq("id", normalizedOwnerId)
    .maybeSingle();

  if (
    ownerError ||
    !ownerProfile ||
    ownerProfile.role !== "owner" ||
    !ownerProfile.is_active
  ) {
    return { ok: false, errors: { ownerId: "Please choose a valid owner." } };
  }

  const { data: slaConfigs, error: slaError } = await supabase
    .from("lrt_sla_configs")
    .select("*")
    .eq("campaign_id", input.campaignId);

  if (slaError) {
    return { ok: false, message: "Unable to load SLA configuration." };
  }

  const slaConfig = pickSlaConfigForLeadType(slaConfigs ?? [], input.leadType);
  const now = new Date();
  const slaDueAt = slaConfig
    ? computeSlaDueAt(now, slaConfig.sla_hours).toISOString()
    : null;

  const submittedOnBehalf =
    ctx.profile.role === "territory_team" && ownerProfile.id !== ctx.profile.id;

  const submittedAt = new Date();
  const msFormUrl = buildMsFormUrl({
    leadType: input.leadType,
    ownerFullName: ownerProfile.full_name ?? "",
    ownerEmail: ownerProfile.email,
    ownerPhone: ownerProfile.phone ?? null,
    ownerOfficeName: ownerProfile.office_name ?? null,
    ownerLegalCorpName: ownerProfile.legal_corp_name ?? null,
    dealerCode: input.dealerCode.trim(),
    dateNeededBy: input.dateNeededBy || null,
    state: input.state,
    dma: input.dma,
    leadAreaRequested: input.requestedLocation,
    submittedAt,
  });

  const { data: inserted, error: insertError } = await supabase
    .from("lrt_lead_requests")
    .insert({
      campaign_id: input.campaignId,
      owner_id: ownerProfile.id,
      submitted_by: ctx.profile.id,
      submitted_on_behalf: submittedOnBehalf,
      lead_type: input.leadType,
      area_type: input.defaultAreaType || "market",
      lead_area_requested: input.requestedLocation,
      date_needed_by: input.dateNeededBy,
      notes: input.notes.trim() || null,
      is_reserve: input.isReserve,
      dealer_code: input.dealerCode.trim(),
      dma: input.dma,
      office: ownerProfile.full_name ?? ownerProfile.email,
      status: "new",
      sla_due_at: slaDueAt,
      form_data: {
        state: input.state,
        zip_codes: input.zipCodes.trim(),
        ms_form_url: msFormUrl,
      },
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { ok: false, message: insertError?.message ?? "Unable to save request." };
  }

  return {
    ok: true,
    requestId: inserted.id,
    redirectTo: ctx.profile.role === "territory_team" ? "/dashboard" : "/my-requests",
    msFormUrl,
  };
}

export async function markRequestSubmittedAction(
  requestId: string,
): Promise<MarkRequestSubmittedResult> {
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
    .select("id, owner_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row) {
    return { ok: false, message: "Request not found." };
  }

  const isOwnerOfRequest =
    ctx.profile.role === "owner" && ctx.profile.id === row.owner_id;
  const isTerritoryTeam = ctx.profile.role === "territory_team";

  if (!isOwnerOfRequest && !isTerritoryTeam) {
    return { ok: false, message: "You do not have permission to update this request." };
  }

  if (row.status !== "new") {
    return { ok: true };
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("lrt_lead_requests")
    .update({
      status: "submitted_to_client",
      updated_at: now,
    })
    .eq("id", id)
    .eq("status", "new")
    .select("id")
    .maybeSingle();

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  if (!updated) {
    return { ok: true };
  }

  const { error: auditError } = await appendAuditLog(supabase, {
    requestId: id,
    fieldName: "status",
    oldValue: "new",
    newValue: "submitted_to_client",
  });

  if (auditError) {
    return {
      ok: false,
      message: "Saved, but failed to write the audit log entry.",
    };
  }

  return { ok: true };
}
