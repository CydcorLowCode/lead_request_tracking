/**
 * Applies a `CommitPayload` update operation to `lrt_lead_requests` + `lrt_audit_log`,
 * mirroring `commit_att_import` RPC semantics.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TablesUpdate } from "@/types/database";

import type { CommitPayload } from "./commit-payload";

export async function applyCommitUpdatePayload(
  supabase: SupabaseClient<Database>,
  payload: Extract<CommitPayload, { op: "update" }>,
  changedByProfileId: string,
): Promise<{ error: string } | { ok: true }> {
  const v_req = payload.request_id;
  const patch = payload.patch;

  const { data: lr, error: loadErr } = await supabase
    .from("lrt_lead_requests")
    .select("id")
    .eq("id", v_req)
    .maybeSingle();

  if (loadErr || !lr) {
    return { error: loadErr?.message ?? "Lead request not found." };
  }

  const row = {
    updated_at: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
  } as TablesUpdate<"lrt_lead_requests">;

  const { error: upErr } = await supabase.from("lrt_lead_requests").update(row).eq("id", v_req);

  if (upErr) {
    return { error: upErr.message };
  }

  for (const line of payload.audit) {
    const fn = line.field_name?.trim();
    if (!fn) continue;
    const { error: aErr } = await supabase.from("lrt_audit_log").insert({
      request_id: v_req,
      changed_by: changedByProfileId,
      field_name: fn,
      old_value: line.old_value,
      new_value: line.new_value,
    });
    if (aErr) {
      return { error: aErr.message };
    }
  }

  return { ok: true };
}
