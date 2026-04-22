/**
 * Types for AT&T NAM report imports: staging rows, matcher outcomes, and parsed XLSX rows.
 */
import type { Tables } from "@/types/database";

export type ImportRow = Tables<"lrt_import_rows">;
export type ImportRun = Tables<"lrt_imports">;

export type MatchStatus =
  | "pending"
  | "matched"
  | "unchanged"
  | "new"
  | "ambiguous_unresolved"
  | "ambiguous_resolved"
  | "ambiguous_deleted"
  | "error"
  | "error_deleted"
  | "applied";

export type MatchTier =
  | "tier_1_confirmation_id"
  | "tier_2_fields"
  | "tier_3_backfill"
  | "tier_dealer_tiebreak";

/** Parsed row from the AT&T NAM REQUESTS sheet (before DB match). */
export type IncomingAttRow = {
  office: string;
  dealer_code: string;
  dma: string;
  lead_type: string;
  lead_area: string;
  submitted_date: string;
  /** ISO date string `YYYY-MM-DD` from the sheet */
  att_confirmation_number: string | null;
  att_decision: string;
  /** 1-based row index in the worksheet (including header offset). */
  sheet_row_index: number;
  /** Original sheet row as header → cell value (JSON-serializable). */
  raw_row: Record<string, unknown>;
};

export type LeadRequestRow = Tables<"lrt_lead_requests">;

export type ImportRowWithCandidates = ImportRow & {
  candidates: LeadRequestRow[];
};

export type ImportRunWithUploader = ImportRun & {
  uploader_name: string | null;
};

export type RowPreviewMeta = {
  field_count: number;
  field_names: string[];
  prev_status: string | null;
  next_status: string | null;
  status_will_change: boolean;
};

export type ImportPreviewRow = ImportRowWithCandidates & {
  linked_request: LeadRequestRow | null;
  preview: RowPreviewMeta;
};
