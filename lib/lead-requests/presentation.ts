import { evaluateSlaStatus } from "@/lib/sla/evaluate";
import {
  LEAD_REQUEST_STATUSES,
  type LeadRequestStatus,
} from "@/types/enums";
import type { Tables } from "@/types/database";

export type LeadRequestRow = Tables<"lrt_lead_requests">;
type SlaConfigLookupRow = Pick<
  Tables<"lrt_sla_configs">,
  "campaign_id" | "lead_type" | "warning_hours"
>;

export function toLeadRequestStatus(value: string): LeadRequestStatus {
  if ((LEAD_REQUEST_STATUSES as readonly string[]).includes(value)) {
    return value as LeadRequestStatus;
  }

  return "new";
}

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatLeadType(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Clean legacy lead_area_requested values for display.
 * Extracts 5-digit zip codes; falls back to raw string if none found.
 * Plain city/market strings pass through unchanged.
 */
export function formatLeadArea(raw: string | null | undefined): string {
  if (!raw) return "—";
  const s = String(raw);
  // If it already looks like a normal location (has a letter followed by
  // a space, like "Bloomfield, IN"), leave it alone.
  if (/[A-Za-z]{2,}\s/.test(s) && !/^\d{5}[A-Z]/.test(s)) return s;
  // Not \b\d{5}\b: digits and letters are both "word" chars, so there is no
  // boundary between `33472` and `B` in legacy blobs like `33472BYBHFLMA4401PB`.
  const re = /(?<!\d)\d{5}(?!\d)/g;
  const seen = new Set<string>();
  const ordered: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (!seen.has(m[0])) {
      seen.add(m[0]);
      ordered.push(m[0]);
    }
  }
  return ordered.length ? ordered.join(", ") : s;
}

export function buildSlaWarningLookup(configs: SlaConfigLookupRow[]) {
  const byCampaignAndLeadType: Record<string, number> = {};
  const byLeadType: Record<string, number> = {};

  for (const config of configs) {
    byCampaignAndLeadType[`${config.campaign_id}:${config.lead_type}`] =
      config.warning_hours;
    byLeadType[config.lead_type] = config.warning_hours;
  }

  return { byCampaignAndLeadType, byLeadType };
}

export function getWarningHoursForRequest(
  request: Pick<LeadRequestRow, "campaign_id" | "lead_type">,
  lookup: ReturnType<typeof buildSlaWarningLookup>,
) {
  return (
    lookup.byCampaignAndLeadType[`${request.campaign_id}:${request.lead_type}`] ??
    lookup.byLeadType[request.lead_type] ??
    null
  );
}

export function sortRequestsBySlaThenCreated(
  rows: LeadRequestRow[],
  lookup: ReturnType<typeof buildSlaWarningLookup>,
) {
  return [...rows].sort((a, b) => {
    const aSla = evaluateSlaStatus({
      status: toLeadRequestStatus(a.status),
      slaDueAt: a.sla_due_at,
      warningHours: getWarningHoursForRequest(a, lookup),
    });
    const bSla = evaluateSlaStatus({
      status: toLeadRequestStatus(b.status),
      slaDueAt: b.sla_due_at,
      warningHours: getWarningHoursForRequest(b, lookup),
    });

    const priority = (state: ReturnType<typeof evaluateSlaStatus>) =>
      state?.status === "overdue" ? 0 : 1;
    const bySla = priority(aSla) - priority(bSla);
    if (bySla !== 0) {
      return bySla;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
