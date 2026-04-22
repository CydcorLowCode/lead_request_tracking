/**
 * Parses AT&T NAM REQUESTS XLSX uploads into {@link IncomingAttRow} records using SheetJS.
 * Column headers are matched case-insensitively; the first worksheet with a header row is used.
 */
import * as XLSX from "xlsx";

import { mapAttLeadTypeToLrt, parseExcelDate } from "@/lib/att-import/report";
import type { IncomingAttRow } from "@/types/import";

type HeaderKey =
  | "office"
  | "dealer"
  | "dma"
  | "lead_type"
  | "lead_area"
  | "submitted"
  | "confirmation"
  | "decision";

const HEADER_ALIASES: Record<HeaderKey, string[]> = {
  office: ["office", "office name"],
  dealer: ["dealer code", "dealer"],
  dma: ["dma"],
  lead_type: ["lead type"],
  lead_area: ["lead area", "lead area requested"],
  submitted: ["submitted", "submitted date"],
  confirmation: ["at&t confirmation", "confirmation number", "confirmation id"],
  decision: ["at&t decision", "decision", "status"],
};

function normHeader(s: unknown): string {
  return String(s ?? "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function buildHeaderMap(headerRow: unknown[]): Map<HeaderKey, number> {
  const cells = headerRow.map((c) => String(c ?? "").trim());
  const normToIndex = new Map<string, number>();
  cells.forEach((raw, i) => {
    const n = normHeader(raw);
    if (n && !normToIndex.has(n)) normToIndex.set(n, i);
  });

  const out = new Map<HeaderKey, number>();
  for (const key of Object.keys(HEADER_ALIASES) as HeaderKey[]) {
    for (const alias of HEADER_ALIASES[key]) {
      const idx = normToIndex.get(alias.toLowerCase());
      if (idx !== undefined) {
        out.set(key, idx);
        break;
      }
    }
  }
  return out;
}

function cellStr(row: unknown[], idx: number | undefined): string {
  if (idx === undefined) return "";
  const v = row[idx];
  if (v == null) return "";
  return String(v).trim();
}

function cellToJson(v: unknown): unknown {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v;
  return String(v);
}

function rawRowObject(
  headerCells: unknown[],
  dataRow: unknown[],
): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  headerCells.forEach((h, i) => {
    const name = String(h ?? "").trim() || `column_${i}`;
    o[name] = cellToJson(dataRow[i]);
  });
  return o;
}

export async function parseAttSheet(file: File): Promise<{
  rows: IncomingAttRow[];
  sheetName: string;
  errors: { row: number; message: string }[];
}> {
  const buf = await file.arrayBuffer();
  const workbook = XLSX.read(buf, { type: "array", cellDates: true });

  let sheetName = workbook.SheetNames[0] ?? "";
  let sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!sheet) {
    return { rows: [], sheetName: "", errors: [{ row: 0, message: "Workbook has no sheets." }] };
  }

  const tryNam = workbook.SheetNames.find((n) => n.trim().toLowerCase() === "nam requests");
  if (tryNam) {
    sheetName = tryNam;
    sheet = workbook.Sheets[sheetName];
  }

  const matrix = XLSX.utils.sheet_to_json(sheet!, {
    header: 1,
    defval: "",
    raw: true,
  }) as unknown[][];

  if (matrix.length < 2) {
    return {
      rows: [],
      sheetName,
      errors: [{ row: 0, message: "Sheet has no data rows below the header." }],
    };
  }

  const headerRow = matrix[0] ?? [];
  const headerMap = buildHeaderMap(headerRow);
  const iOffice = headerMap.get("office");
  const iLead = headerMap.get("lead_type");
  const iArea = headerMap.get("lead_area");
  const iSubmitted = headerMap.get("submitted");

  const missingCols: string[] = [];
  if (iOffice === undefined) missingCols.push("Office / Office Name");
  if (iLead === undefined) missingCols.push("Lead Type");
  if (iArea === undefined) missingCols.push("Lead Area / Lead Area Requested");
  if (iSubmitted === undefined) missingCols.push("Submitted / Submitted Date");
  if (missingCols.length > 0) {
    return {
      rows: [],
      sheetName,
      errors: [
        {
          row: 1,
          message: `Missing required columns: ${missingCols.join(", ")}.`,
        },
      ],
    };
  }

  const iDealer = headerMap.get("dealer");
  const iDma = headerMap.get("dma");
  const iConf = headerMap.get("confirmation");
  const iDecision = headerMap.get("decision");

  const rows: IncomingAttRow[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const line = matrix[r];
    if (!line || line.every((c) => String(c ?? "").trim() === "")) continue;

    const office = cellStr(line, iOffice);
    const leadTypeRaw = cellStr(line, iLead);
    const leadArea = cellStr(line, iArea);
    const submittedRaw = line?.[iSubmitted!];
    const submittedDate = parseExcelDate(submittedRaw);

    const leadType = mapAttLeadTypeToLrt(leadTypeRaw);
    const raw_row = rawRowObject(headerRow, line);

    const problems: string[] = [];
    if (!office) problems.push("office");
    if (!leadTypeRaw) problems.push("lead_type");
    else if (!leadType) problems.push("lead_type (unmapped AT&T label)");
    if (!leadArea) problems.push("lead_area");
    if (!submittedDate) problems.push("submitted_date");

    if (problems.length > 0) {
      errors.push({
        row: r + 1,
        message: `Row ${r + 1}: missing or invalid ${problems.join(", ")}.`,
      });
      continue;
    }

    const d = submittedDate!;
    const submittedIso = d.toISOString().slice(0, 10);

    const confRaw = cellStr(line, iConf);
    const decisionRaw = cellStr(line, iDecision);

    rows.push({
      office,
      dealer_code: cellStr(line, iDealer),
      dma: cellStr(line, iDma),
      lead_type: leadType!,
      lead_area: leadArea,
      submitted_date: submittedIso,
      att_confirmation_number: confRaw === "" ? null : confRaw,
      att_decision: decisionRaw,
      sheet_row_index: r + 1,
      raw_row,
    });
  }

  return { rows, sheetName, errors };
}
