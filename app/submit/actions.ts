"use server";

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

type SubmitLeadRequestResult = {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
  redirectTo?: string;
};

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
    .select("id, full_name, email, role, is_active")
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

  const { error: insertError } = await supabase.from("lrt_lead_requests").insert({
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
    },
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  return {
    ok: true,
    redirectTo: ctx.profile.role === "territory_team" ? "/dashboard" : "/my-requests",
  };
}
