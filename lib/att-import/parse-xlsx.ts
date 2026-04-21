import * as XLSX from "xlsx";

import { normalizeHeaderCell } from "@/lib/att-import/report";

export const NAM_SHEET_NAME = "NAM REQUESTS";

export const WRONG_SHEET_ERROR =
  "This doesn't look like an AT&T D2D report. Expected a sheet named 'NAM REQUESTS'.";

export type ParsedAttSheetRow = {
  attId: string;
  dealerCode: string;
  officeName: string;
  leadTypeRaw: string;
  dma: string;
  state: string;
  submittedDateRaw: unknown;
  attStatusRaw: string;
  processDateRaw: unknown;
  rlmNotes: string;
  submitterNotes: string;
  zipAreaField: string;
};

function findZipColumnIndex(headers: string[]): number | null {
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].startsWith("Enter City, State, Zip Code")) {
      return i;
    }
  }
  return null;
}

function buildHeaderIndex(headerRow: unknown[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((cell, i) => {
    const name = normalizeHeaderCell(cell);
    if (name) map.set(name, i);
  });
  return map;
}

function cell(row: unknown[], idx: number | undefined): string {
  if (idx === undefined) return "";
  const v = row[idx];
  if (v == null) return "";
  return String(v).trim();
}

/** Column header names after normalization (for lookup). */
const COL = {
  id: "Id",
  dealer: "Dealer Code",
  subDealer: "Sub-Dealer",
  leadType: "Lead Request Type",
  dma: "DMA",
  state: "State",
  submitted: "Submitted date",
  status: "Request Status",
  process: "Process Date",
  rlm: "RLM NOTES",
  notes: "Notes",
} as const;

export type ParseNamSheetResult =
  | { ok: true; rows: ParsedAttSheetRow[] }
  | { ok: false; error: string };

export function parseNamRequestsSheet(workbook: XLSX.WorkBook): ParseNamSheetResult {
  const sheet = workbook.Sheets[NAM_SHEET_NAME];
  if (!sheet) {
    return { ok: false, error: WRONG_SHEET_ERROR };
  }

  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
  }) as unknown[][];

  if (matrix.length < 3) {
    return { ok: false, error: "This spreadsheet has no data rows under the header." };
  }

  const headerCells = matrix[1] ?? [];
  const headers = headerCells.map((c) => normalizeHeaderCell(c));
  const byNorm = buildHeaderIndex(headerCells);

  const idx = (canonical: string): number | undefined => {
    if (byNorm.has(canonical)) return byNorm.get(canonical);
    return undefined;
  };

  const zipIdx = findZipColumnIndex(headers);

  const iId = idx(COL.id);
  const iDealer = idx(COL.dealer);
  const iOffice = idx(COL.subDealer);
  const iLead = idx(COL.leadType);
  const iDma = idx(COL.dma);
  const iState = idx(COL.state);
  const iSubmitted = idx(COL.submitted);
  const iStatus = idx(COL.status);
  const iProcess = idx(COL.process);
  const iRlm = idx(COL.rlm);
  // "Notes" header in exports often includes a trailing NBSP (e.g. "Notes\xa0"); normalizeHeaderCell
  // collapses that to "Notes". If the header row shape changes, column 18 is the submitter Notes field.
  const iNotes = idx(COL.notes) ?? (headerCells.length > 18 ? 18 : undefined);

  const rows: ParsedAttSheetRow[] = [];

  for (let r = 2; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.every((c) => String(c ?? "").trim() === "")) continue;

    const attId = cell(row, iId);
    const dealerCode = cell(row, iDealer);
    const attStatusRaw = cell(row, iStatus);

    if (!attId && !dealerCode && !attStatusRaw) continue;

    rows.push({
      attId,
      dealerCode,
      officeName: cell(row, iOffice),
      leadTypeRaw: cell(row, iLead),
      dma: cell(row, iDma),
      state: cell(row, iState),
      submittedDateRaw: iSubmitted !== undefined ? row[iSubmitted] : "",
      attStatusRaw,
      processDateRaw: iProcess !== undefined ? row[iProcess] : "",
      rlmNotes: cell(row, iRlm),
      submitterNotes: cell(row, iNotes),
      zipAreaField: cell(row, zipIdx ?? undefined),
    });
  }

  return { ok: true, rows };
}

export function readWorkbookFromArrayBuffer(buf: ArrayBuffer): XLSX.WorkBook {
  return XLSX.read(buf, { type: "array", cellDates: true });
}
