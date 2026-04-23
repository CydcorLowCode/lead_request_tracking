import type { Tables } from "@/types/database";
import type { LeadRequestStatus } from "@/types/enums";

export type LeadRequestForReport = Tables<"lrt_lead_requests">;

/**
 * === METRIC DEFINITIONS ===
 *
 * Approval Rate:
 *   numerator   = count(status = 'visible_in_salesforce') excluding reserves
 *   denominator = numerator + count(status = 'declined')   excluding reserves
 *
 *   OPEN QUESTION FOR TERRITORY TEAM: how should `market_proposal_answered`
 *   and `leads_pulled_back` count here? Current working assumption is that
 *   both are excluded from numerator AND denominator because they aren't
 *   approval/denial decisions. Revisit once the team confirms.
 *
 * Avg Response Time:
 *   avg(resolved_at - created_at) across records where resolved_at is not null.
 *   resolved_at is maintained by DB trigger on terminal-state transitions;
 *   the AT&T import pipeline will later overwrite it with AT&T's actual
 *   response timestamp, which is more accurate.
 *
 * SLA Compliance:
 *   numerator   = count(resolved_at <= sla_due_at) among resolved records
 *   denominator = count(resolved records with sla_due_at not null)
 *   In-flight records are not evaluable and excluded entirely.
 */

// ---- Terminal & approval status sets ----

export const TERMINAL_STATUSES = new Set<LeadRequestStatus>([
  "visible_in_salesforce",
  "declined",
  "leads_pulled_back",
  "market_proposal_answered",
]);

const APPROVED: LeadRequestStatus = "visible_in_salesforce";
const DENIED: LeadRequestStatus = "declined";

// ---- Date range ----

export type DateRange = { from: Date; to: Date };

export function rangeOfLastNDays(days: number, now: Date = new Date()): DateRange {
  const to = new Date(now);
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { from, to };
}

/** The equal-length window immediately preceding the given range. */
export function previousRange({ from, to }: DateRange): DateRange {
  const len = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - len),
    to: new Date(to.getTime() - len),
  };
}

export function filterCreatedInRange<T extends { created_at: string }>(
  rows: T[],
  { from, to }: DateRange,
): T[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();
  return rows.filter((r) => {
    const ts = new Date(r.created_at).getTime();
    return ts >= fromMs && ts <= toMs;
  });
}

// ---- Single-period metrics ----

export type PeriodMetrics = {
  totalRequests: number;
  approvalRate: {
    approved: number;
    denied: number;
    decided: number;
    ratePct: number | null;
  };
  avgResponseHours: number | null;
  slaCompliance: {
    compliant: number;
    evaluated: number;
    ratePct: number | null;
  };
  byLeadType: Array<{ key: string; count: number; approvalPct: number | null }>;
  statusBreakdown: Array<{ status: LeadRequestStatus; count: number }>;
  byDma: Array<{ key: string; count: number }>;
  byOwner: Array<{ ownerId: string; count: number }>;
};

export function computePeriodMetrics(rows: LeadRequestForReport[]): PeriodMetrics {
  const nonReserve = rows.filter((r) => !r.is_reserve);

  // Approval
  const approved = nonReserve.filter((r) => r.status === APPROVED).length;
  const denied = nonReserve.filter((r) => r.status === DENIED).length;
  const decided = approved + denied;
  const approvalRate = {
    approved,
    denied,
    decided,
    ratePct: decided === 0 ? null : Math.round((approved / decided) * 100),
  };

  // Response time (uses real resolved_at now)
  const resolved = rows.filter((r) => r.resolved_at != null);
  const avgResponseHours =
    resolved.length === 0
      ? null
      : Math.round(
          resolved.reduce(
            (acc, r) =>
              acc +
              (new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()),
            0,
          ) /
            resolved.length /
            3600000,
        );

  // SLA compliance — only evaluate resolved records with a due date
  const slaEvaluable = resolved.filter((r) => r.sla_due_at != null);
  const slaCompliantCount = slaEvaluable.filter(
    (r) => new Date(r.resolved_at!).getTime() <= new Date(r.sla_due_at!).getTime(),
  ).length;
  const slaCompliance = {
    compliant: slaCompliantCount,
    evaluated: slaEvaluable.length,
    ratePct:
      slaEvaluable.length === 0
        ? null
        : Math.round((slaCompliantCount / slaEvaluable.length) * 100),
  };

  // Breakdowns
  const byLeadType = tallyWithApproval(rows);
  const statusBreakdown = tallyStatuses(rows);
  const byDma = tallyBy(rows, (r) => r.dma ?? "—");
  const byOwner = tallyBy(rows, (r) => r.owner_id).map((x) => ({
    ownerId: x.key,
    count: x.count,
  }));

  return {
    totalRequests: rows.length,
    approvalRate,
    avgResponseHours,
    slaCompliance,
    byLeadType,
    statusBreakdown,
    byDma,
    byOwner,
  };
}

// ---- Period-over-period deltas ----

export type Delta =
  | { kind: "pct_points"; value: number } // for percentages
  | { kind: "count"; value: number } // for integer counts
  | { kind: "hours"; value: number } // for response time
  | { kind: "none" };

export type PeriodComparison = {
  current: PeriodMetrics;
  previous: PeriodMetrics;
  deltas: {
    totalRequestsPct: Delta; // % growth in volume
    approvalRatePct: Delta; // percentage-point change
    avgResponseHours: Delta; // hour change (negative = faster)
    slaCompliancePct: Delta; // percentage-point change
  };
};

export function comparePeriods(
  current: PeriodMetrics,
  previous: PeriodMetrics,
): PeriodComparison["deltas"] {
  return {
    totalRequestsPct:
      previous.totalRequests === 0
        ? { kind: "none" }
        : {
            kind: "count",
            value: Math.round(
              ((current.totalRequests - previous.totalRequests) / previous.totalRequests) * 100,
            ),
          },
    approvalRatePct: pctPointDelta(
      current.approvalRate.ratePct,
      previous.approvalRate.ratePct,
    ),
    avgResponseHours:
      current.avgResponseHours === null || previous.avgResponseHours === null
        ? { kind: "none" }
        : {
            kind: "hours",
            value: current.avgResponseHours - previous.avgResponseHours,
          },
    slaCompliancePct: pctPointDelta(
      current.slaCompliance.ratePct,
      previous.slaCompliance.ratePct,
    ),
  };
}

function pctPointDelta(a: number | null, b: number | null): Delta {
  if (a === null || b === null) return { kind: "none" };
  return { kind: "pct_points", value: a - b };
}

// ---- helpers ----

function tallyBy<T>(rows: T[], key: (r: T) => string) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function tallyStatuses(rows: LeadRequestForReport[]) {
  const map = new Map<LeadRequestStatus, number>();
  for (const r of rows) {
    const s = r.status as LeadRequestStatus;
    map.set(s, (map.get(s) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

function tallyWithApproval(rows: LeadRequestForReport[]) {
  const grouped = new Map<string, { total: number; approved: number; decided: number }>();
  for (const r of rows) {
    if (r.is_reserve) continue; // mirrors the approval-rate rule
    const key = r.lead_type;
    const bucket = grouped.get(key) ?? { total: 0, approved: 0, decided: 0 };
    bucket.total += 1;
    if (r.status === APPROVED) {
      bucket.approved += 1;
      bucket.decided += 1;
    } else if (r.status === DENIED) {
      bucket.decided += 1;
    }
    grouped.set(key, bucket);
  }
  return Array.from(grouped.entries())
    .map(([key, { total, approved, decided }]) => ({
      key,
      count: total,
      approvalPct: decided === 0 ? null : Math.round((approved / decided) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}
