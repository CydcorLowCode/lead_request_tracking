"use server";

import { appendAuditLog } from "@/lib/audit/append-audit-log";
import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import type { LeadRequestStatus } from "@/types/enums";
import { LEAD_REQUEST_STATUSES } from "@/types/enums";

export type AttImportRow = {
  lrtId: string;
  status?: string;
  attConfirmationNumber?: string;
  approvedZipCodes?: string;
  deniedZipCodes?: string;
  /** AT&T "RLM NOTES" — decision explanation, stored as notes_for_icl (visible to owner). */
  notesForIcl?: string;
  /** AT&T "Notes" — submitter request text, stored as internal_notes (territory team only). */
  internalNotes?: string;
  attResponseAt?: string;
};

export type AttImportResult = {
  ok: boolean;
  updated: number;
  skipped: number;
  errors: string[];
};

function toValidStatus(value: string | undefined): LeadRequestStatus | null {
  if (value == null) return null;
  if ((LEAD_REQUEST_STATUSES as readonly string[]).includes(value)) {
    return value as LeadRequestStatus;
  }
  return null;
}

function normText(v: string | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t === "" ? null : t;
}

// TODO: add optional per-record notification trigger for Phase 2 after confirming with territory team

type RowOutcome = "updated" | "skipped" | "error";

export async function importAttReportAction(rows: AttImportRow[]): Promise<AttImportResult> {
  const ctx = await getSessionContext();
  if (!ctx) {
    return { ok: false, updated: 0, skipped: 0, errors: ["You must be signed in."] };
  }
  if (ctx.profile.role !== "territory_team") {
    return { ok: false, updated: 0, skipped: 0, errors: ["Only territory team members can import."] };
  }

  const byId = new Map<string, AttImportRow>();
  for (const row of rows) {
    const id = row.lrtId?.trim();
    if (id) byId.set(id, row);
  }
  const uniqueRows = Array.from(byId.values());
  if (uniqueRows.length === 0) {
    return { ok: true, updated: 0, skipped: 0, errors: [] };
  }

  const supabase = await createClient();
  const ids = uniqueRows.map((r) => r.lrtId.trim());

  const { data: currentRows, error: fetchError } = await supabase
    .from("lrt_lead_requests")
    .select(
      "id, status, att_confirmation_number, approved_zip_codes, denied_zip_codes, notes_for_icl, internal_notes, att_response_at",
    )
    .in("id", ids);

  if (fetchError || !currentRows) {
    return {
      ok: false,
      updated: 0,
      skipped: 0,
      errors: [fetchError?.message ?? "Failed to load current requests."],
    };
  }

  const currentById = new Map(currentRows.map((r) => [r.id, r]));
  const errors: string[] = [];

  async function processOne(input: AttImportRow): Promise<RowOutcome> {
    const id = input.lrtId.trim();
    const cur = currentById.get(id);
    if (!cur) {
      errors.push(`${id}: Request not found.`);
      return "error";
    }

    if (input.status !== undefined) {
      const s = toValidStatus(input.status);
      if (!s) {
        errors.push(`${id}: Invalid status value.`);
        return "error";
      }
    }

    const now = new Date().toISOString();
    const patch: Record<string, string | null> = {};
    const auditSpecs: { fieldName: string; oldValue: string | null; newValue: string | null }[] = [];

    if (input.status !== undefined) {
      const newStatus = toValidStatus(input.status);
      if (newStatus && newStatus !== cur.status) {
        patch.status = newStatus;
        auditSpecs.push({ fieldName: "status", oldValue: cur.status, newValue: newStatus });
      }
    }

    if (input.attConfirmationNumber !== undefined) {
      const next = normText(input.attConfirmationNumber);
      const prev = cur.att_confirmation_number?.trim() || null;
      if (next !== prev) {
        patch.att_confirmation_number = next;
        auditSpecs.push({
          fieldName: "att_confirmation_number",
          oldValue: prev,
          newValue: next,
        });
      }
    }

    if (input.approvedZipCodes !== undefined) {
      const next = normText(input.approvedZipCodes);
      const prev = cur.approved_zip_codes?.trim() || null;
      if (next !== prev) {
        patch.approved_zip_codes = next;
        auditSpecs.push({ fieldName: "approved_zip_codes", oldValue: prev, newValue: next });
      }
    }

    if (input.deniedZipCodes !== undefined) {
      const next = normText(input.deniedZipCodes);
      const prev = cur.denied_zip_codes?.trim() || null;
      if (next !== prev) {
        patch.denied_zip_codes = next;
        auditSpecs.push({ fieldName: "denied_zip_codes", oldValue: prev, newValue: next });
      }
    }

    if (input.notesForIcl !== undefined) {
      const next = normText(input.notesForIcl);
      const prev = cur.notes_for_icl?.trim() || null;
      if (next !== prev) {
        patch.notes_for_icl = next;
        auditSpecs.push({ fieldName: "notes_for_icl", oldValue: prev, newValue: next });
      }
    }

    if (input.internalNotes !== undefined) {
      const next = normText(input.internalNotes);
      const prev = cur.internal_notes?.trim() || null;
      if (next !== prev) {
        patch.internal_notes = next;
        auditSpecs.push({ fieldName: "internal_notes", oldValue: prev, newValue: next });
      }
    }

    if (input.attResponseAt !== undefined && input.attResponseAt.trim() !== "") {
      if (!cur.att_response_at) {
        const iso = input.attResponseAt.trim();
        patch.att_response_at = iso;
        auditSpecs.push({
          fieldName: "att_response_at",
          oldValue: cur.att_response_at,
          newValue: iso,
        });
      }
    }

    if (Object.keys(patch).length === 0) {
      return "skipped";
    }

    const { error: updateError } = await supabase
      .from("lrt_lead_requests")
      .update({
        ...patch,
        updated_at: now,
      })
      .eq("id", id);

    if (updateError) {
      errors.push(`${id}: ${updateError.message}`);
      return "error";
    }

    for (const spec of auditSpecs) {
      const { error: auditError } = await appendAuditLog(supabase, {
        requestId: id,
        fieldName: spec.fieldName,
        oldValue: spec.oldValue,
        newValue: spec.newValue,
      });
      if (auditError) {
        errors.push(`${id}: Updated row but audit log failed (${spec.fieldName}).`);
      }
    }

    return "updated";
  }

  let updated = 0;
  let skipped = 0;
  const chunkSize = 20;

  for (let i = 0; i < uniqueRows.length; i += chunkSize) {
    const chunk = uniqueRows.slice(i, i + chunkSize);
    const outcomes = await Promise.all(chunk.map((row) => processOne(row)));
    for (const o of outcomes) {
      if (o === "updated") updated += 1;
      if (o === "skipped") skipped += 1;
    }
  }

  return { ok: true, updated, skipped, errors };
}
