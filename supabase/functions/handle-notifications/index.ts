import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// --- Types -----------------------------------------------------------------

type WebhookPayload = {
  type: "INSERT" | "UPDATE";
  record: LeadRequestRecord;
  old_record?: LeadRequestRecord | null;
};

type LeadRequestRecord = Record<string, unknown> & {
  id: string;
  owner_id: string;
  lead_type: string;
  status: string;
  office: string | null;
  dealer_code: string | null;
  lead_area_requested: string;
  date_needed_by: string | null;
  dma: string | null;
  notes: string | null;
  notes_for_icl: string | null;
  approved_zip_codes: string | null;
  denied_zip_codes: string | null;
  form_data: unknown;
};

type OwnerProfile = {
  id: string;
  email: string;
  full_name: string | null;
};

const LEAD_TYPE_LABELS: Record<string, string> = {
  permanent_assignment: "Permanent Assignment",
  business_trip: "Business Trip",
  nlt_new_fiber: "NLT New Fiber",
  market_proposal: "Market Proposal",
  oof_wireless: "OOF / Wireless",
  pullback: "Pullback",
};

const RESEND_URL = "https://api.resend.com/emails";

// --- Helpers ---------------------------------------------------------------

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function leadTypeDisplayName(leadType: string): string {
  return LEAD_TYPE_LABELS[leadType] ?? leadType;
}

function formatDateNeeded(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function firstName(fullName: string | null | undefined, email: string): string {
  const trimmed = fullName?.trim();
  if (trimmed) {
    const part = trimmed.split(/\s+/)[0];
    if (part) return part;
  }
  const local = email.split("@")[0];
  if (local) return local;
  return "there";
}

function appBaseUrl(): string {
  const raw = Deno.env.get("APP_URL") ?? "";
  return raw.replace(/\/+$/, "");
}

function viewRequestUrl(requestId: string): string {
  return `${appBaseUrl()}/requests/${requestId}`;
}

function viewYourRequestLabel(): string {
  return "[View Your Request]";
}

function getState(record: LeadRequestRecord): string {
  const top = record.state;
  if (typeof top === "string" && top.trim()) return top;
  const fd = record.form_data;
  if (fd && typeof fd === "object" && !Array.isArray(fd)) {
    const s = (fd as { state?: unknown }).state;
    if (typeof s === "string" && s.trim()) return s;
  }
  return "";
}

function isDmaWarning(record: LeadRequestRecord): boolean {
  return record.dma_warning === true;
}

function defaultFrom(): string {
  const name = Deno.env.get("NOTIFY_FROM_NAME") ?? "LRT – Lead Request Tracker";
  const email = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "noreply@lrt.cydcor.com";
  return `${name} <${email}>`;
}

type ResendPayload = {
  from: string;
  to: string | string[];
  bcc?: string;
  reply_to?: string;
  subject: string;
  text: string;
  html: string;
};

async function sendResendEmail(payload: ResendPayload): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.error("handle-notifications: RESEND_API_KEY is not set");
    return false;
  }
  try {
    const body: Record<string, unknown> = {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    };
    if (payload.bcc) body.bcc = payload.bcc;
    if (payload.reply_to) body.reply_to = payload.reply_to;

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(
        "handle-notifications: Resend error",
        res.status,
        errText,
      );
      return false;
    }
    return true;
  } catch (e) {
    console.error("handle-notifications: Resend fetch failed", e);
    return false;
  }
}

async function fetchOwner(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<OwnerProfile | null> {
  try {
    const { data, error } = await supabase
      .from("lrt_profiles")
      .select("id, email, full_name")
      .eq("id", ownerId)
      .maybeSingle();

    if (error) {
      console.error("handle-notifications: owner lookup error", error);
      return null;
    }
    if (!data?.email) {
      console.error("handle-notifications: owner missing email", ownerId);
      return null;
    }
    return data as OwnerProfile;
  } catch (e) {
    console.error("handle-notifications: owner lookup exception", e);
    return null;
  }
}

async function fetchTerritoryTeamUserIds(
  supabase: SupabaseClient,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("lrt_profiles")
      .select("id")
      .eq("role", "territory_team");

    if (error) {
      console.error("handle-notifications: territory_team query error", error);
      return [];
    }
    return (data ?? []).map((r: { id: string }) => r.id).filter(Boolean);
  } catch (e) {
    console.error("handle-notifications: territory_team query exception", e);
    return [];
  }
}

/** Inserts in-app notification; logs errors, never throws. */
async function insertNotification(
  supabase: SupabaseClient,
  row: {
    user_id: string;
    request_id: string;
    trigger: string;
    message: string;
  },
): Promise<void> {
  try {
    const { error } = await supabase.from("lrt_notifications").insert({
      user_id: row.user_id,
      request_id: row.request_id,
      trigger: row.trigger,
      message: row.message,
      read: false,
    });
    if (error) {
      console.error("handle-notifications: insert notification failed", error);
    }
  } catch (e) {
    console.error("handle-notifications: insert notification exception", e);
  }
}

function linkFooterText(url: string, label: string): string {
  return `\n\n${label} → ${url}`;
}

function linkFooterHtml(url: string, label: string): string {
  return `<p><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></p>`;
}

// --- Triggers --------------------------------------------------------------

async function runT1NewSubmission(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
): Promise<void> {
  const owner = await fetchOwner(supabase, record.owner_id);
  const url = viewRequestUrl(record.id);
  const display = leadTypeDisplayName(record.lead_type);
  const ownerName = owner?.full_name?.trim() || "Unknown";
  const dateStr = formatDateNeeded(record.date_needed_by);

  const lines = [
    `Requester Name: ${ownerName}`,
    `Requester ICL: ${record.office ?? ""}`,
    `Dealer Code: ${record.dealer_code ?? ""}`,
    `Lead Type: ${display}`,
    `Area Requested: ${record.lead_area_requested}`,
    `Date Needed: ${dateStr}`,
    `State: ${getState(record)}`,
    `DMA: ${record.dma ?? ""}`,
    `Notes: ${record.notes ?? ""}`,
  ];
  const text =
    lines.join("\n") + linkFooterText(url, "[View Request in LRT App]");
  const html =
    `<p>${lines.map((l) => escapeHtml(l)).join("<br>")}</p>` +
    linkFooterHtml(url, "[View Request in LRT App]");

  await sendResendEmail({
    from: defaultFrom(),
    to: "attleads@cydcor.com",
    reply_to: owner?.email,
    subject: "A Lead Request has been submitted",
    text,
    html,
  });
}

async function runT1bDmaWarning(
  record: LeadRequestRecord,
): Promise<void> {
  const url = viewRequestUrl(record.id);
  const dma = record.dma ?? "";
  const bodyText =
    `${dma}: A request has been made in the LRT tool within a Verizon 5G exclusive market. Please validate that it does not conflict with our client contracts.` +
    linkFooterText(url, "[View Request]");
  const bodyHtml =
    `<p>${escapeHtml(dma)}: A request has been made in the LRT tool within a Verizon 5G exclusive market. Please validate that it does not conflict with our client contracts.</p>` +
    linkFooterHtml(url, "[View Request]");

  await sendResendEmail({
    from: defaultFrom(),
    to: "attleads@cydcor.com",
    subject: "Lead Request - DMA Warning",
    text: bodyText,
    html: bodyHtml,
  });
}

async function runT2SubmittedToAtt(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
): Promise<void> {
  const owner = await fetchOwner(supabase, record.owner_id);
  if (!owner) return;

  const url = viewRequestUrl(record.id);
  const fn = firstName(owner.full_name, owner.email);
  const display = leadTypeDisplayName(record.lead_type);
  const dateStr = formatDateNeeded(record.date_needed_by);

  const text =
    `Hi ${fn}, your lead request has been submitted to AT&T. Per the client, your submittal will be processed within 10 business days.\n` +
    `Lead Type: ${display} | Area: ${record.lead_area_requested} | Date Needed: ${dateStr}` +
    linkFooterText(url, viewYourRequestLabel());
  const html =
    `<p>Hi ${escapeHtml(fn)}, your lead request has been submitted to AT&amp;T. Per the client, your submittal will be processed within 10 business days.</p>` +
    `<p>Lead Type: ${escapeHtml(display)} | Area: ${escapeHtml(record.lead_area_requested)} | Date Needed: ${escapeHtml(dateStr)}</p>` +
    linkFooterHtml(url, viewYourRequestLabel());

  await sendResendEmail({
    from: defaultFrom(),
    to: owner.email,
    bcc: "attleads@cydcor.com",
    reply_to: "Territory@cydcor.com",
    subject: "AT&T Res Lead Request Submitted!",
    text,
    html,
  });

  // After email attempt: still insert in-app so the owner is not silently missed if Resend fails.
  await insertNotification(supabase, {
    user_id: record.owner_id,
    request_id: record.id,
    trigger: "submitted_att",
    message: "Your lead request was submitted to AT&T.",
  });
}

async function runT3LeadsReceived(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
): Promise<void> {
  const owner = await fetchOwner(supabase, record.owner_id);
  if (!owner) return;

  const url = viewRequestUrl(record.id);
  const fn = firstName(owner.full_name, owner.email);

  const text =
    `Hi ${fn}, Cydcor has received leads from AT&T. If you do not see your new zip codes in Salesforce within 4 business days, please reach out to Territory@cydcor.com.\n` +
    `Approved Zip Codes: ${record.approved_zip_codes ?? ""}\n` +
    `Notes: ${record.notes_for_icl ?? ""}` +
    linkFooterText(url, viewYourRequestLabel());
  const html =
    `<p>Hi ${escapeHtml(fn)}, Cydcor has received leads from AT&amp;T. If you do not see your new zip codes in Salesforce within 4 business days, please reach out to Territory@cydcor.com.</p>` +
    `<p>Approved Zip Codes: ${escapeHtml(record.approved_zip_codes ?? "")}<br>Notes: ${escapeHtml(record.notes_for_icl ?? "")}</p>` +
    linkFooterHtml(url, viewYourRequestLabel());

  await sendResendEmail({
    from: defaultFrom(),
    to: owner.email,
    bcc: "attleads@cydcor.com",
    reply_to: "salesforceterritory@cydcor.com",
    subject: "Your AT&T leads have been received!",
    text,
    html,
  });

  await insertNotification(supabase, {
    user_id: record.owner_id,
    request_id: record.id,
    trigger: "leads_received",
    message: "AT&T leads have been received; check Salesforce within 4 business days.",
  });
}

async function runT4VisibleSf(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
): Promise<void> {
  const owner = await fetchOwner(supabase, record.owner_id);
  if (!owner) return;

  const url = viewRequestUrl(record.id);
  const fn = firstName(owner.full_name, owner.email);

  const text =
    `Hi ${fn}, your AT&T leads are now available to view in Salesforce.\n` +
    `Approved Zip Codes: ${record.approved_zip_codes ?? ""}` +
    linkFooterText(url, viewYourRequestLabel());
  const html =
    `<p>Hi ${escapeHtml(fn)}, your AT&amp;T leads are now available to view in Salesforce.</p>` +
    `<p>Approved Zip Codes: ${escapeHtml(record.approved_zip_codes ?? "")}</p>` +
    linkFooterHtml(url, viewYourRequestLabel());

  await sendResendEmail({
    from: defaultFrom(),
    to: owner.email,
    bcc: "attleads@cydcor.com",
    reply_to: "salesforceterritory@cydcor.com",
    subject: "AT&T Leads Available in Salesforce",
    text,
    html,
  });

  await insertNotification(supabase, {
    user_id: record.owner_id,
    request_id: record.id,
    trigger: "visible_sf",
    message: "Your AT&T leads are visible in Salesforce.",
  });
}

async function runT5Declined(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
): Promise<void> {
  const owner = await fetchOwner(supabase, record.owner_id);
  if (!owner) return;

  const url = viewRequestUrl(record.id);
  const fn = firstName(owner.full_name, owner.email);

  const text =
    `Hi ${fn}, your request has been declined by AT&T.\n` +
    `Denied Zip Codes: ${record.denied_zip_codes ?? ""}\n` +
    `Notes: ${record.notes_for_icl ?? ""}` +
    linkFooterText(url, viewYourRequestLabel());
  const html =
    `<p>Hi ${escapeHtml(fn)}, your request has been declined by AT&amp;T.</p>` +
    `<p>Denied Zip Codes: ${escapeHtml(record.denied_zip_codes ?? "")}<br>Notes: ${escapeHtml(record.notes_for_icl ?? "")}</p>` +
    linkFooterHtml(url, viewYourRequestLabel());

  await sendResendEmail({
    from: defaultFrom(),
    to: owner.email,
    bcc: "attleads@cydcor.com",
    reply_to: "salesforceterritory@cydcor.com",
    subject: "Your AT&T Leads Have Been Denied",
    text,
    html,
  });

  await insertNotification(supabase, {
    user_id: record.owner_id,
    request_id: record.id,
    trigger: "declined",
    message: "Your AT&T lead request was declined.",
  });
}

async function runT6Pullback(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
  withTerritoryInApp: boolean,
): Promise<void> {
  const owner = await fetchOwner(supabase, record.owner_id);
  const ownerName = owner?.full_name?.trim() || "Unknown";

  const url = viewRequestUrl(record.id);
  const text =
    `An owner has sent in a request to give up a zip code. Let's see what we can do to save it!\n` +
    `Owner: ${ownerName} | ICL: ${record.office ?? ""} | Dealer Code: ${record.dealer_code ?? ""}\n` +
    `Area: ${record.lead_area_requested} | Notes: ${record.notes ?? ""}` +
    linkFooterText(url, "[View Request]");
  const html =
    `<p>An owner has sent in a request to give up a zip code. Let's see what we can do to save it!</p>` +
    `<p>Owner: ${escapeHtml(ownerName)} | ICL: ${escapeHtml(record.office ?? "")} | Dealer Code: ${escapeHtml(record.dealer_code ?? "")}<br>` +
    `Area: ${escapeHtml(record.lead_area_requested)} | Notes: ${escapeHtml(record.notes ?? "")}</p>` +
    linkFooterHtml(url, "[View Request]");

  await sendResendEmail({
    from: "Cydcor Territory <territory@cyddrive.com>",
    to: "ATTLeads@cydcor.com",
    subject: "Zip Swap/Pullback Requested",
    text,
    html,
  });

  if (withTerritoryInApp) {
    const ids = await fetchTerritoryTeamUserIds(supabase);
    for (const userId of ids) {
      await insertNotification(supabase, {
        user_id: userId,
        request_id: record.id,
        trigger: "pullback",
        message: "A zip swap / pullback request was submitted.",
      });
    }
  }
}

async function runT7NotesForIcl(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
): Promise<void> {
  const owner = await fetchOwner(supabase, record.owner_id);
  if (!owner) return;

  const url = viewRequestUrl(record.id);
  const fn = firstName(owner.full_name, owner.email);
  const display = leadTypeDisplayName(record.lead_type);
  const note = record.notes_for_icl ?? "";

  const text =
    `Hi ${fn}, the territory team has left a note on your lead request:\n` +
    `"${note}"\n` +
    `Lead Type: ${display} | Area: ${record.lead_area_requested}` +
    linkFooterText(url, viewYourRequestLabel());
  const html =
    `<p>Hi ${escapeHtml(fn)}, the territory team has left a note on your lead request:</p>` +
    `<blockquote>${escapeHtml(note)}</blockquote>` +
    `<p>Lead Type: ${escapeHtml(display)} | Area: ${escapeHtml(record.lead_area_requested)}</p>` +
    linkFooterHtml(url, viewYourRequestLabel());

  await sendResendEmail({
    from: defaultFrom(),
    to: owner.email,
    bcc: "attleads@cydcor.com",
    reply_to: "Territory@cydcor.com",
    subject: "Update on your AT&T lead request",
    text,
    html,
  });

  await insertNotification(supabase, {
    user_id: record.owner_id,
    request_id: record.id,
    trigger: "notes_for_icl",
    message: "The territory team left a note on your lead request.",
  });
}

// --- Router ----------------------------------------------------------------

async function handleInsert(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
): Promise<void> {
  if (record.lead_type === "pullback") {
    await runT6Pullback(supabase, record, true);
    return;
  }

  await runT1NewSubmission(supabase, record);
  if (isDmaWarning(record)) {
    await runT1bDmaWarning(record);
  }
}

async function handleUpdate(
  supabase: SupabaseClient,
  record: LeadRequestRecord,
  oldRecord: LeadRequestRecord,
): Promise<void> {
  const prevStatus = oldRecord.status;
  const nextStatus = record.status;

  if (prevStatus !== nextStatus) {
    switch (nextStatus) {
      case "submitted_to_client":
        await runT2SubmittedToAtt(supabase, record);
        break;
      case "leads_received":
        await runT3LeadsReceived(supabase, record);
        break;
      case "visible_in_salesforce":
        await runT4VisibleSf(supabase, record);
        break;
      case "declined":
        await runT5Declined(supabase, record);
        break;
      case "leads_pulled_back":
        await runT6Pullback(supabase, record, true);
        break;
      default:
        break;
    }
    return;
  }

  const rawNotes = record.notes_for_icl;
  const notesNonEmpty =
    typeof rawNotes === "string" && rawNotes.trim().length > 0;
  if (notesNonEmpty && rawNotes !== oldRecord.notes_for_icl) {
    await runT7NotesForIcl(supabase, record);
  }
}

// --- Entry -----------------------------------------------------------------

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return json({ ok: true, skipped: "method" });
    }

    let payload: WebhookPayload;
    try {
      payload = await req.json();
    } catch {
      console.error("handle-notifications: invalid JSON body");
      return json({ ok: true });
    }

    if (!payload?.record?.id || !payload.record.owner_id) {
      console.error("handle-notifications: missing record.id or owner_id");
      return json({ ok: true });
    }

    if (payload.type !== "INSERT" && payload.type !== "UPDATE") {
      return json({ ok: true, skipped: "type" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ??
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error(
        "handle-notifications: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing",
      );
      return json({ ok: true });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const record = payload.record as LeadRequestRecord;

    if (payload.type === "INSERT") {
      await handleInsert(supabase, record);
    } else {
      const oldRecord = (payload.old_record ?? {}) as LeadRequestRecord;
      await handleUpdate(supabase, record, oldRecord);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("handle-notifications: unhandled error", e);
    return json({ ok: true });
  }
});
