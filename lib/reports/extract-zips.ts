import type { Tables } from "@/types/database";

export type RequestWithFormData = Tables<"lrt_lead_requests">;

const ZIP_RE = /\b\d{5}\b/g;

/**
 * Returns unique 5-digit zip codes parsed from a request's form_data.zip_codes
 * free-text field. Falls back to scanning lead_area_requested if zip_codes is
 * empty. Interim — proper fix is a requested_zips text[] column.
 */
export function extractZipsFromRequest(row: RequestWithFormData): string[] {
  const formData = (row.form_data ?? {}) as Record<string, unknown>;
  const raw = typeof formData.zip_codes === "string" ? formData.zip_codes : "";
  const fallback = raw.trim().length === 0 ? row.lead_area_requested ?? "" : "";
  const combined = `${raw} ${fallback}`;
  const matches = combined.match(ZIP_RE) ?? [];
  return Array.from(new Set(matches));
}
