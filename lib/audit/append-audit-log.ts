import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type AppendAuditLogParams = {
  requestId: string;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
};

/**
 * Appends an audit row via the database RPC. Do not insert into `lrt_audit_log` directly from the app.
 */
export async function appendAuditLog(
  supabase: SupabaseClient<Database>,
  params: AppendAuditLogParams,
) {
  return supabase.rpc("lrt_append_audit_log", {
    p_request_id: params.requestId,
    p_field_name: params.fieldName ?? null,
    p_old_value: params.oldValue ?? null,
    p_new_value: params.newValue ?? null,
  });
}
