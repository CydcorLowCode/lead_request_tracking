import type { LeadRequestStatus } from "@/types/enums";
import type { LeadType } from "@/types/enums";

/** Raw AT&T "Request Status" → LRT status (undefined = unmapped / unknown). */
export function mapAttStatusToLrtStatus(raw: string): LeadRequestStatus | undefined {
  const key = raw.replace(/\s+/g, " ").trim();
  const map: Record<string, LeadRequestStatus> = {
    APPROVED: "visible_in_salesforce",
    DENIED: "declined",
    "PARTIAL APPROVAL": "leads_received",
    "CLOSED - MARKET PROPOSAL/ZIP LIST": "market_proposal_answered",
    "CLOSED - NO ACTION NEEDED": "declined",
    "HOLD - PENDING INFO": "submitted_to_client",
    "CANCELLED BY SUBMITTER": "leads_pulled_back",
  };
  return map[key];
}

/** HOLD must not change status in DB — still mapped above for display only. */
export function isHoldPendingInfo(raw: string): boolean {
  return raw.replace(/\s+/g, " ").trim() === "HOLD - PENDING INFO";
}

const LEAD_TYPE_BY_ATT_LABEL: Record<string, LeadType> = {
  "SLA 2 - Weekly New Fiber Road Trip": "nlt_new_fiber",
  "SLA 2 - Weekly Unassigned New Fiber Road Trip": "nlt_new_fiber",
  "SLA 10 - Additional Leads": "permanent_assignment",
  "SLA 10 - Additional Leads - Incumbent Sub-Dealer": "permanent_assignment",
  "SLA 10 - 30 Days Road Trip/Seasonal": "business_trip",
  "SLA 10 - Market Proposal/Zip Code List": "market_proposal",
  "SLA 10 - Market Proposal/Zip Code List (Check DMA availability in MOR Report)": "market_proposal",
  "SLA 10 - OOF - AIA/WIRELESS": "oof_wireless",
  "Pullback/Remove Zip Code": "pullback",
  "SLA 30 - New Office or New Dealer": "permanent_assignment",
  "SLA 30 - New Office or New Dealer (Check DMA availability in MOR Report)": "permanent_assignment",
};

/** AT&T "Lead Request Type" display string → DB `lead_type` family (same keys as `LEAD_TYPE_BY_ATT_LABEL`). */
export const LEAD_TYPE_FAMILY_MAP: Record<string, string> = LEAD_TYPE_BY_ATT_LABEL;

export function mapAttLeadTypeToLrt(leadTypeRaw: string): LeadType | undefined {
  const key = leadTypeRaw.replace(/\n/g, " ").trim();
  return LEAD_TYPE_BY_ATT_LABEL[key];
}

export function normalizeHeaderCell(v: unknown): string {
  return String(v ?? "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeDmaForMatch(s: string): string {
  return s
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "");
}

export function normalizeAttId(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(Math.trunc(v));
  }
  return String(v).trim();
}

export function parseExcelDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const utc = Math.round((value - 25569) * 86400 * 1000);
    const d = new Date(utc);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Normalize office/ICL name for fuzzy matching (Sub-Dealer vs `office`). */
export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/,?\s*(inc\.?|llc\.?|ltd\.?|incorporated|corp\.?)$/i, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function sameDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export function withinDays(a: Date, b: Date, n: number): boolean {
  const diffMs = Math.abs(a.getTime() - b.getTime());
  return diffMs <= n * 24 * 60 * 60 * 1000;
}

export function calendarDaysApart(a: Date, b: Date): number {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((start.getTime() - end.getTime()) / 86400000);
}

/** First-seen unique 5-digit zips, joined with ", ". */
export function extractZipsJoined(text: string): string | null {
  const s = text.replace(/\n/g, " ");
  const re = /\b\d{5}\b/g;
  const seen = new Set<string>();
  const ordered: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, "g");
  while ((m = r.exec(s)) !== null) {
    if (!seen.has(m[0])) {
      seen.add(m[0]);
      ordered.push(m[0]);
    }
  }
  if (ordered.length === 0) return null;
  return ordered.join(", ");
}

export function combineZipSources(primary: string, fallback: string): string | null {
  const a = extractZipsJoined(primary);
  const b = extractZipsJoined(fallback);
  if (a) return a;
  if (b) return b;
  return null;
}

export type LrtMatchRow = {
  id: string;
  dealer_code: string | null;
  dma: string | null;
  lead_type: string;
  lead_area_requested: string;
  created_at: string;
  status: string;
  att_confirmation_number: string | null;
  approved_zip_codes: string | null;
  denied_zip_codes: string | null;
  notes_for_icl: string | null;
  internal_notes: string | null;
  office: string | null;
  att_submitted_at: string | null;
  att_response_at: string | null;
};

export type MatchOutcome =
  | { kind: "matched"; lrtId: string }
  | { kind: "unmatched" }
  | { kind: "ambiguous"; count: number };

export function matchAttRowToLrt(
  att: {
    attId: string;
    dealerCode: string;
    officeName: string;
    leadTypeRaw: string;
    submittedDate: Date | null;
  },
  lrtRows: LrtMatchRow[],
): MatchOutcome {
  const attIdNorm = normalizeAttId(att.attId);
  if (attIdNorm) {
    const p1 = lrtRows.filter((r) => (r.att_confirmation_number ?? "").trim() === attIdNorm);
    if (p1.length === 1) return { kind: "matched", lrtId: p1[0].id };
    if (p1.length > 1) return { kind: "ambiguous", count: p1.length };
  }

  const rowDealerCode = att.dealerCode.trim().toUpperCase();
  if (!att.submittedDate || !rowDealerCode) {
    return { kind: "unmatched" };
  }
  const submitted = att.submittedDate;

  const lrtLead = mapAttLeadTypeToLrt(att.leadTypeRaw);
  if (lrtLead) {
    const p2 = lrtRows.filter((r) => {
      if ((r.dealer_code ?? "").trim().toUpperCase() !== rowDealerCode) return false;
      if (r.lead_type !== lrtLead) return false;
      const dbDate = r.att_submitted_at ? new Date(r.att_submitted_at) : null;
      if (!dbDate || Number.isNaN(dbDate.getTime())) return false;
      return sameDay(submitted, dbDate);
    });
    if (p2.length === 1) return { kind: "matched", lrtId: p2[0].id };
    if (p2.length > 1) return { kind: "ambiguous", count: p2.length };
  }

  const rowOfficeNorm = normalizeName(att.officeName);
  const p3 = lrtRows.filter((r) => {
    if ((r.dealer_code ?? "").trim().toUpperCase() !== rowDealerCode) return false;
    const dbDate = r.att_submitted_at ? new Date(r.att_submitted_at) : null;
    if (!dbDate || Number.isNaN(dbDate.getTime())) return false;
    if (!withinDays(submitted, dbDate, 7)) return false;
    const dbOfficeNorm = normalizeName(r.office ?? "");
    return (
      rowOfficeNorm.length >= 4 &&
      dbOfficeNorm.length >= 4 &&
      (rowOfficeNorm.includes(dbOfficeNorm) || dbOfficeNorm.includes(rowOfficeNorm))
    );
  });
  if (p3.length === 1) return { kind: "matched", lrtId: p3[0].id };
  if (p3.length > 1) return { kind: "ambiguous", count: p3.length };

  return { kind: "unmatched" };
}

export function shouldApplyZipApproved(attStatusRaw: string): boolean {
  const k = attStatusRaw.replace(/\s+/g, " ").trim().toUpperCase();
  return k === "APPROVED" || k === "PARTIAL APPROVAL";
}

export function shouldApplyZipDenied(attStatusRaw: string): boolean {
  const k = attStatusRaw.replace(/\s+/g, " ").trim().toUpperCase();
  return k === "DENIED" || k === "CLOSED - NO ACTION NEEDED";
}
