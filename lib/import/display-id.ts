import type { Tables } from "@/types/database";

/** Human-readable id: `LR-` + `YYYYMMDD` from `created_at` + last 3 hex chars of UUID (uppercase). */
export function formatLrtPublicId(
  req: Pick<Tables<"lrt_lead_requests">, "id" | "created_at">,
): string {
  const ymd = req.created_at.slice(0, 10).replace(/-/g, "");
  const suffix = req.id.replace(/-/g, "").slice(-3).toUpperCase();
  return `LR-${ymd}-${suffix}`;
}
