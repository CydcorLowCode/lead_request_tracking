"use server";

/**
 * Server actions for AT&T NAM report import: create preview, resolve ambiguities, commit, cancel.
 */
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json, TablesInsert } from "@/types/database";
import type { ImportPreviewRow, ImportRunWithUploader } from "@/types/import";
import type { Tables } from "@/types/database";

import { ATT_CAMPAIGN_ID } from "@/lib/campaigns/constants";
import { requireTerritoryTeam } from "@/lib/auth/require-territory-team";
import { applyCommitUpdatePayload } from "@/lib/import/apply-commit-update";
import { buildInsertPayload, buildUpdatePayload, type CommitPayload } from "@/lib/import/commit-payload";
import { computeRowPreviewMeta } from "@/lib/import/preview-meta";
import { matchIncomingRow } from "@/lib/import/matcher";
import { parseAttSheet } from "@/lib/import/parse-att-sheet";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function commitResultFromRpc(data: Json | null): {
  applied_updates: number;
  applied_inserts: number;
  applied_resolved: number;
  skipped_ambiguous: number;
} | null {
  if (!isRecord(data)) return null;
  const n = (x: unknown) => (typeof x === "number" ? x : Number(x));
  return {
    applied_updates: n(data.applied_updates),
    applied_inserts: n(data.applied_inserts),
    applied_resolved: n(data.applied_resolved),
    skipped_ambiguous: n(data.skipped_ambiguous),
  };
}

export async function createImport(
  formData: FormData,
): Promise<{ importId: string } | { error: string }> {
  const gate = await requireTerritoryTeam();
  if ("error" in gate) return { error: gate.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a non-empty spreadsheet file." };
  }

  const { supabase, profile } = gate;
  const { rows, sheetName, errors: parseErrors } = await parseAttSheet(file);

  const parse_errors: Json = parseErrors as unknown as Json;

  const { data: created, error: insErr } = await supabase
    .from("lrt_imports")
    .insert({
      campaign_id: ATT_CAMPAIGN_ID,
      status: "parsing",
      created_by: profile.id,
      file_name: file.name,
      sheet_name: sheetName,
      parse_errors,
    })
    .select("id")
    .single();

  if (insErr || !created) {
    return { error: insErr?.message ?? "Unable to create import." };
  }

  const importId = created.id;

  const rowPayloads: TablesInsert<"lrt_import_rows">[] = [];

  for (const incoming of rows) {
    const m = await matchIncomingRow(incoming, ATT_CAMPAIGN_ID, supabase);
    rowPayloads.push({
      import_id: importId,
      sheet_row_index: incoming.sheet_row_index,
      raw_row: incoming.raw_row as unknown as Json,
      office: incoming.office,
      dealer_code: incoming.dealer_code,
      dma: incoming.dma,
      lead_type: incoming.lead_type,
      lead_area: incoming.lead_area,
      submitted_date: incoming.submitted_date,
      att_confirmation_number: incoming.att_confirmation_number,
      att_decision: incoming.att_decision,
      match_status: m.match_status,
      match_tier: m.match_tier,
      candidate_request_ids: m.candidate_request_ids,
      linked_request_id: m.linked_request_id,
      error_message: m.error_message ?? null,
      resolved_owner_id: m.resolved_owner_id ?? null,
    });
  }

  if (rowPayloads.length > 0) {
    const { error: rowErr } = await supabase.from("lrt_import_rows").insert(rowPayloads);
    if (rowErr) {
      await supabase.from("lrt_imports").delete().eq("id", importId);
      return { error: rowErr.message };
    }
  }

  const { error: upErr } = await supabase
    .from("lrt_imports")
    .update({ status: "preview" })
    .eq("id", importId);

  if (upErr) {
    return { error: upErr.message };
  }

  revalidatePath("/imports");
  return { importId };
}

export async function getImportPreview(
  importId: string,
): Promise<
  | { import: ImportRunWithUploader; rows: ImportPreviewRow[]; profileNames: Record<string, string> }
  | { error: string }
> {
  const gate = await requireTerritoryTeam();
  if ("error" in gate) return { error: gate.error };

  const { supabase, profile } = gate;
  const id = importId.trim();
  if (!id) return { error: "Invalid import id." };

  const { data: imp, error: iErr } = await supabase
    .from("lrt_imports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (iErr || !imp) {
    return { error: iErr?.message ?? "Import not found." };
  }

  const { data: uploader } = await supabase
    .from("lrt_profiles")
    .select("full_name, email")
    .eq("id", imp.created_by)
    .maybeSingle();

  const uploader_name = uploader?.full_name?.trim() || uploader?.email || null;
  const importWithUploader: ImportRunWithUploader = { ...imp, uploader_name };

  const { data: rowList, error: rErr } = await supabase
    .from("lrt_import_rows")
    .select("*")
    .eq("import_id", id)
    .order("sheet_row_index", { ascending: true });

  if (rErr || !rowList) {
    return { error: rErr?.message ?? "Unable to load import rows." };
  }

  const candidateIds = rowList.flatMap((r) => r.candidate_request_ids ?? []);
  const linkedIds = rowList.map((r) => r.linked_request_id).filter((x): x is string => x != null);
  const allRequestIds = [...new Set([...candidateIds, ...linkedIds])];

  let byId = new Map<string, Tables<"lrt_lead_requests">>();
  if (allRequestIds.length > 0) {
    const { data: reqs, error: qErr } = await supabase
      .from("lrt_lead_requests")
      .select("*")
      .in("id", allRequestIds);
    if (qErr) {
      return { error: qErr.message };
    }
    byId = new Map((reqs ?? []).map((r) => [r.id, r]));
  }

  const submitterIds = [
    ...new Set(
      [...byId.values()].map((r) => r.submitted_by).filter(Boolean),
    ),
  ] as string[];
  const profileNames: Record<string, string> = {};
  if (submitterIds.length > 0) {
    const { data: profs } = await supabase
      .from("lrt_profiles")
      .select("id, full_name, email")
      .in("id", submitterIds);
    for (const p of profs ?? []) {
      profileNames[p.id] = p.full_name?.trim() || p.email || "—";
    }
  }

  const rows: ImportPreviewRow[] = rowList.map((r) => {
    const linked = r.linked_request_id ? (byId.get(r.linked_request_id) ?? null) : null;
    const preview = computeRowPreviewMeta(r, linked, imp.campaign_id, profile.id);
    return {
      ...r,
      linked_request: linked,
      preview,
      candidates: (r.candidate_request_ids ?? [])
        .map((cid) => byId.get(cid))
        .filter((x): x is Tables<"lrt_lead_requests"> => x != null),
    };
  });

  return { import: importWithUploader, rows, profileNames };
}

export async function resolveAmbiguousRow(
  importRowId: string,
  chosenRequestId: string,
): Promise<{ success: true } | { error: string }> {
  const gate = await requireTerritoryTeam();
  if ("error" in gate) return { error: gate.error };

  const { supabase, profile } = gate;
  const rowId = importRowId.trim();
  const pick = chosenRequestId.trim();
  if (!rowId || !pick) return { error: "Invalid row or request id." };

  const { data: row, error: fErr } = await supabase
    .from("lrt_import_rows")
    .select("*")
    .eq("id", rowId)
    .maybeSingle();

  if (fErr || !row) return { error: fErr?.message ?? "Row not found." };
  if (row.match_status !== "ambiguous_unresolved") {
    return { error: "Row is not unresolved ambiguous." };
  }
  if (!(row.candidate_request_ids ?? []).includes(pick)) {
    return { error: "Chosen request is not among candidates." };
  }

  const { data: imp, error: impErr } = await supabase
    .from("lrt_imports")
    .select("id, status, campaign_id")
    .eq("id", row.import_id)
    .maybeSingle();

  if (impErr || !imp) return { error: impErr?.message ?? "Import not found." };

  const now = new Date().toISOString();

  if (imp.status === "committed") {
    const resolvedRow: Tables<"lrt_import_rows"> = {
      ...row,
      match_status: "ambiguous_resolved",
      linked_request_id: pick,
    };
    const payload = await loadPayloadForRow(supabase, resolvedRow, imp.campaign_id, profile.id);
    if (!payload || payload.op !== "update") {
      return { error: "Unable to build update for resolved row." };
    }
    const applied = await applyCommitUpdatePayload(supabase, payload, profile.id);
    if ("error" in applied) {
      return { error: applied.error };
    }
    const { error: uErr } = await supabase
      .from("lrt_import_rows")
      .update({
        match_status: "applied",
        linked_request_id: pick,
        resolved_by: profile.id,
        resolved_at: now,
        applied_at: now,
        commit_payload: null,
      })
      .eq("id", rowId);

    if (uErr) return { error: uErr.message };
    revalidatePath("/imports");
    revalidatePath(`/imports/${row.import_id}`);
    return { success: true };
  }

  const { error: uErr } = await supabase
    .from("lrt_import_rows")
    .update({
      match_status: "ambiguous_resolved",
      linked_request_id: pick,
      resolved_by: profile.id,
      resolved_at: now,
    })
    .eq("id", rowId);

  if (uErr) return { error: uErr.message };
  revalidatePath("/imports");
  revalidatePath(`/imports/${row.import_id}`);
  return { success: true };
}

export async function deleteAmbiguousRow(
  importRowId: string,
  reason?: string,
): Promise<{ success: true } | { error: string }> {
  const gate = await requireTerritoryTeam();
  if ("error" in gate) return { error: gate.error };

  const { supabase, profile } = gate;
  const rowId = importRowId.trim();
  if (!rowId) return { error: "Invalid row id." };

  const { data: row, error: fErr } = await supabase
    .from("lrt_import_rows")
    .select("id, import_id, match_status")
    .eq("id", rowId)
    .maybeSingle();

  if (fErr || !row) return { error: fErr?.message ?? "Row not found." };

  const now = new Date().toISOString();
  if (row.match_status === "ambiguous_unresolved") {
    const { error: uErr } = await supabase
      .from("lrt_import_rows")
      .update({
        match_status: "ambiguous_deleted",
        deleted_by: profile.id,
        deleted_at: now,
        delete_reason: reason?.trim() || null,
      })
      .eq("id", rowId);

    if (uErr) return { error: uErr.message };
    revalidatePath("/imports");
    revalidatePath(`/imports/${row.import_id}`);
    return { success: true };
  }

  if (row.match_status === "error") {
    const { error: uErr } = await supabase
      .from("lrt_import_rows")
      .update({
        match_status: "error_deleted",
        deleted_by: profile.id,
        deleted_at: now,
        delete_reason: reason?.trim() || null,
      })
      .eq("id", rowId);

    if (uErr) return { error: uErr.message };
    revalidatePath("/imports");
    revalidatePath(`/imports/${row.import_id}`);
    return { success: true };
  }

  return { error: "Row cannot be deleted from this state." };
}

async function loadPayloadForRow(
  supabase: SupabaseClient<Database>,
  row: Tables<"lrt_import_rows">,
  campaignId: string,
  ttProfileId: string,
): Promise<CommitPayload | null> {
  const incoming = {
    office: row.office,
    dealer_code: row.dealer_code,
    dma: row.dma,
    lead_area: row.lead_area,
    lead_type: row.lead_type,
    submitted_date: row.submitted_date,
    att_confirmation_number: row.att_confirmation_number,
    att_decision: row.att_decision,
  };

  if (row.match_status === "new") {
    if (!row.resolved_owner_id) return null;
    return buildInsertPayload(incoming, row.resolved_owner_id, ttProfileId, campaignId);
  }

  if (row.match_status === "matched" || row.match_status === "ambiguous_resolved") {
    const rid = row.linked_request_id;
    if (!rid) return null;
    const { data: lr, error } = await supabase
      .from("lrt_lead_requests")
      .select("*")
      .eq("id", rid)
      .maybeSingle();
    if (error || !lr) return null;
    return buildUpdatePayload(incoming, lr);
  }

  return null;
}

export async function commitImport(
  importId: string,
): Promise<
  | {
      applied_updates: number;
      applied_inserts: number;
      applied_resolved: number;
      skipped_ambiguous: number;
    }
  | { error: string }
> {
  const gate = await requireTerritoryTeam();
  if ("error" in gate) return { error: gate.error };

  const { supabase, profile } = gate;
  const id = importId.trim();
  if (!id) return { error: "Invalid import id." };

  const { data: imp, error: iErr } = await supabase
    .from("lrt_imports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (iErr || !imp) return { error: iErr?.message ?? "Import not found." };
  if (imp.status !== "preview") {
    return { error: "Import is not in preview status." };
  }

  const { data: rowList, error: rErr } = await supabase
    .from("lrt_import_rows")
    .select("*")
    .eq("import_id", id);

  if (rErr || !rowList) return { error: rErr?.message ?? "Unable to load rows." };

  for (const row of rowList) {
    if (
      row.match_status !== "matched" &&
      row.match_status !== "new" &&
      row.match_status !== "ambiguous_resolved"
    ) {
      continue;
    }

    const payload = await loadPayloadForRow(supabase, row, imp.campaign_id, profile.id);
    if (!payload) {
      await supabase.from("lrt_import_rows").update({ commit_payload: null }).eq("id", row.id);
      continue;
    }

    const { error: pErr } = await supabase
      .from("lrt_import_rows")
      .update({ commit_payload: payload as unknown as Json })
      .eq("id", row.id);

    if (pErr) {
      return { error: pErr.message };
    }
  }

  const { data: rpcData, error: rpcErr } = await supabase.rpc("commit_att_import", {
    p_import_id: id,
    p_committed_by_profile: profile.id,
  });

  if (rpcErr) {
    return { error: rpcErr.message };
  }

  const parsed = commitResultFromRpc(rpcData);
  if (!parsed) {
    return { error: "Commit finished but returned an unexpected payload." };
  }

  revalidatePath("/imports");
  revalidatePath(`/imports/${id}`);
  return parsed;
}

export type UnresolvedImportGroup = {
  import: ImportRunWithUploader;
  rows: ImportPreviewRow[];
  profileNames: Record<string, string>;
};

/**
 * All ambiguous_unresolved rows grouped by parent import (for /imports Unresolved tab).
 */
export async function getUnresolvedImportGroups(): Promise<
  { groups: UnresolvedImportGroup[] } | { error: string }
> {
  const gate = await requireTerritoryTeam();
  if ("error" in gate) return { error: gate.error };

  const { supabase } = gate;
  const { data: refs, error: rErr } = await supabase
    .from("lrt_import_rows")
    .select("import_id")
    .eq("match_status", "ambiguous_unresolved");

  if (rErr) return { error: rErr.message };
  const importIds = [...new Set((refs ?? []).map((r) => r.import_id))];
  if (importIds.length === 0) {
    return { groups: [] };
  }

  const { data: imports, error: iErr } = await supabase
    .from("lrt_imports")
    .select("*")
    .in("id", importIds)
    .order("created_at", { ascending: false });

  if (iErr || !imports) return { error: iErr?.message ?? "Unable to load imports." };

  const groups: UnresolvedImportGroup[] = [];
  for (const imp of imports) {
    const prev = await getImportPreview(imp.id);
    if ("error" in prev) {
      return { error: prev.error };
    }
    const unresolvedOnly = prev.rows.filter((row) => row.match_status === "ambiguous_unresolved");
    if (unresolvedOnly.length === 0) continue;
    groups.push({
      import: prev.import,
      rows: unresolvedOnly,
      profileNames: prev.profileNames,
    });
  }

  return { groups };
}

export async function cancelImport(importId: string): Promise<{ success: true } | { error: string }> {
  const gate = await requireTerritoryTeam();
  if ("error" in gate) return { error: gate.error };

  const { supabase } = gate;
  const id = importId.trim();
  if (!id) return { error: "Invalid import id." };

  const { data: imp, error: fErr } = await supabase
    .from("lrt_imports")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (fErr || !imp) return { error: fErr?.message ?? "Import not found." };
  if (imp.status !== "preview") {
    return { error: "Only preview imports can be cancelled." };
  }

  const { error: uErr } = await supabase.from("lrt_imports").update({ status: "cancelled" }).eq("id", id);

  if (uErr) return { error: uErr.message };
  revalidatePath("/imports");
  revalidatePath(`/imports/${id}`);
  return { success: true };
}
