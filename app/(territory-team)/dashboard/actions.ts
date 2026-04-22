"use server";

import { appendAuditLog } from "@/lib/audit/append-audit-log";
import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import type { LeadRequestStatus } from "@/types/enums";
import { LEAD_REQUEST_STATUSES } from "@/types/enums";

export type BulkUpdateStatusInput = {
  ids: string[];
  status: string;
};

export type BulkUpdateStatusResult = {
  ok: boolean;
  message?: string;
};

export type BulkDeleteRequestsInput = {
  ids: string[];
};

export type BulkDeleteRequestsResult = {
  ok: boolean;
  message?: string;
};

function toValidStatus(value: string): LeadRequestStatus | null {
  if ((LEAD_REQUEST_STATUSES as readonly string[]).includes(value)) {
    return value as LeadRequestStatus;
  }
  return null;
}

export async function bulkUpdateStatusAction(
  input: BulkUpdateStatusInput,
): Promise<BulkUpdateStatusResult> {
  const ctx = await getSessionContext();
  if (!ctx) {
    return { ok: false, message: "You must be signed in." };
  }

  if (ctx.profile.role !== "territory_team") {
    return { ok: false, message: "Only territory team members can update request statuses." };
  }

  const nextStatus = toValidStatus(input.status);
  if (!nextStatus) {
    return { ok: false, message: "Invalid status value." };
  }

  const ids = Array.from(
    new Set(
      input.ids
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );
  if (ids.length === 0) {
    return { ok: false, message: "Select at least one request." };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: updatedRows, error: updateError } = await supabase
    .from("lrt_lead_requests")
    .update({
      status: nextStatus,
      updated_at: now,
    })
    .in("id", ids)
    .select("id");

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  for (const requestId of ids) {
    const { error: auditError } = await appendAuditLog(supabase, {
      requestId,
      fieldName: "status",
      oldValue: null,
      newValue: nextStatus,
    });
    if (auditError) {
      return {
        ok: false,
        message: "Status updated, but failed to write one or more audit log entries.",
      };
    }
  }

  const updatedCount = updatedRows?.length ?? 0;
  return {
    ok: true,
    message: `Updated ${updatedCount} request${updatedCount === 1 ? "" : "s"}.`,
  };
}

export async function bulkDeleteRequestsAction(
  input: BulkDeleteRequestsInput,
): Promise<BulkDeleteRequestsResult> {
  const ctx = await getSessionContext();
  if (!ctx) {
    return { ok: false, message: "You must be signed in." };
  }

  const ids = Array.from(
    new Set(
      input.ids
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );
  if (ids.length === 0) {
    return { ok: false, message: "Select at least one request." };
  }

  const supabase = await createClient();

  if (ctx.profile.role === "owner") {
    const { data: owned, error: ownedError } = await supabase
      .from("lrt_lead_requests")
      .select("id")
      .in("id", ids)
      .eq("owner_id", ctx.profile.id);

    if (ownedError) {
      return { ok: false, message: ownedError.message };
    }
    const ownedSet = new Set((owned ?? []).map((r) => r.id));
    if (ownedSet.size !== ids.length) {
      return { ok: false, message: "You can only delete your own requests." };
    }
  } else if (ctx.profile.role !== "territory_team") {
    return { ok: false, message: "You do not have permission to delete requests." };
  }

  const { data: deletedRows, error: deleteError } = await supabase
    .from("lrt_lead_requests")
    .delete()
    .in("id", ids)
    .select("id");

  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  const deletedCount = deletedRows?.length ?? 0;
  if (deletedCount === 0 && ids.length > 0) {
    return {
      ok: false,
      message:
        "Delete removed no rows. Apply pending Supabase migrations (DELETE policies on lrt_lead_requests) or confirm you are allowed to delete these requests.",
    };
  }

  return {
    ok: true,
    message: `Deleted ${deletedCount} request${deletedCount === 1 ? "" : "s"}.`,
  };
}
