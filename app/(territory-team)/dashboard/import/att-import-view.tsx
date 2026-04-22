"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { importAttReportAction, type AttImportRow } from "@/app/(territory-team)/dashboard/import/actions";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  combineZipSources,
  isHoldPendingInfo,
  mapAttLeadTypeToLrt,
  mapAttStatusToLrtStatus,
  matchAttRowToLrt,
  normalizeAttId,
  parseExcelDate,
  shouldApplyZipApproved,
  shouldApplyZipDenied,
  type LrtMatchRow,
} from "@/lib/att-import/report";
import {
  parseNamRequestsSheet,
  readWorkbookFromArrayBuffer,
  type ParsedAttSheetRow,
} from "@/lib/att-import/parse-xlsx";
import { formatLeadType } from "@/lib/lead-requests/presentation";
import { createClient } from "@/lib/supabase/client";
import type { LeadRequestStatus } from "@/types/enums";

import * as XLSX from "xlsx";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  submitted_to_client: "Submitted to AT&T",
  leads_received: "Leads Received by Cydcor",
  visible_in_salesforce: "Visible in Salesforce",
  declined: "Declined",
  market_proposal_answered: "Market Proposal Answered",
  leads_pulled_back: "Leads Pulled Back by Client",
};

const TERMINAL: Set<LeadRequestStatus> = new Set([
  "visible_in_salesforce",
  "declined",
  "leads_pulled_back",
  "market_proposal_answered",
]);

type PreviewFilter = "all" | "matched" | "unmatched" | "no_change";

type MatchKind = "matched" | "unmatched" | "ambiguous";

type PreviewRow = {
  key: string;
  parsed: ParsedAttSheetRow;
  submittedDate: Date | null;
  processDateIso: string | null;
  match: MatchKind;
  ambiguousCount: number;
  lrt: LrtMatchRow | null;
  mappedStatus: LeadRequestStatus | undefined;
  skipStatus: boolean;
  payload: AttImportRow;
  changeCount: number;
  hasChanges: boolean;
};

function statusLabel(s: string | undefined | null): string {
  if (!s) return "—";
  return STATUS_LABELS[s] ?? s;
}

function formatSubmitted(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** DB column names that will change on apply (for preview tooltip). */
function listChangedDbFields(
  lrt: LrtMatchRow,
  payload: AttImportRow,
  skipStatus: boolean,
  mappedStatus: LeadRequestStatus | undefined,
): string[] {
  const fields: string[] = [];
  if (!skipStatus && mappedStatus && mappedStatus !== lrt.status) {
    fields.push("status");
  }
  const nextConf = (payload.attConfirmationNumber ?? "").trim() || null;
  const prevConf = lrt.att_confirmation_number?.trim() || null;
  if (payload.attConfirmationNumber !== undefined && nextConf !== prevConf) {
    fields.push("att_confirmation_number");
  }
  if (payload.approvedZipCodes !== undefined) {
    const a = (payload.approvedZipCodes ?? "").trim() || null;
    const b = lrt.approved_zip_codes?.trim() || null;
    if (a !== b) fields.push("approved_zip_codes");
  }
  if (payload.deniedZipCodes !== undefined) {
    const a = (payload.deniedZipCodes ?? "").trim() || null;
    const b = lrt.denied_zip_codes?.trim() || null;
    if (a !== b) fields.push("denied_zip_codes");
  }
  if (payload.notesForIcl !== undefined) {
    const a = (payload.notesForIcl ?? "").trim() || null;
    const b = lrt.notes_for_icl?.trim() || null;
    if (a !== b) fields.push("notes_for_icl");
  }
  if (payload.internalNotes !== undefined) {
    const a = (payload.internalNotes ?? "").trim() || null;
    const b = lrt.internal_notes?.trim() || null;
    if (a !== b) fields.push("internal_notes");
  }
  if (payload.attResponseAt && !lrt.att_response_at) {
    fields.push("att_response_at");
  }
  return fields;
}

function countFieldDiffs(
  lrt: LrtMatchRow,
  payload: AttImportRow,
  skipStatus: boolean,
  mappedStatus: LeadRequestStatus | undefined,
): number {
  return listChangedDbFields(lrt, payload, skipStatus, mappedStatus).length;
}

function buildPayloadForRow(
  parsed: ParsedAttSheetRow,
  lrt: LrtMatchRow,
  submittedDate: Date | null,
  processDateIso: string | null,
): AttImportRow {
  const attId = normalizeAttId(parsed.attId);
  const hold = isHoldPendingInfo(parsed.attStatusRaw);
  const mapped = mapAttStatusToLrtStatus(parsed.attStatusRaw);

  const payload: AttImportRow = { lrtId: lrt.id };

  if (!hold && mapped) {
    payload.status = mapped;
  }

  if (attId) {
    payload.attConfirmationNumber = attId;
  }

  const raw = parsed.attStatusRaw;
  if (shouldApplyZipApproved(raw)) {
    const z = combineZipSources(parsed.zipAreaField, parsed.submitterNotes);
    if (z) payload.approvedZipCodes = z;
  }
  if (shouldApplyZipDenied(raw)) {
    const z = combineZipSources(parsed.zipAreaField, parsed.submitterNotes);
    if (z) payload.deniedZipCodes = z;
  }

  const rlm = parsed.rlmNotes.trim();
  if (rlm) {
    payload.notesForIcl = rlm;
  }

  const requestNotes = parsed.submitterNotes.trim();
  if (requestNotes) {
    payload.internalNotes = requestNotes;
  }

  if (processDateIso && !lrt.att_response_at) {
    payload.attResponseAt = processDateIso;
  }

  return payload;
}

function buildPreviewRows(parsedRows: ParsedAttSheetRow[], lrtRows: LrtMatchRow[]): PreviewRow[] {
  return parsedRows.map((parsed, index) => {
    const submittedDate = parseExcelDate(parsed.submittedDateRaw);
    const proc = parseExcelDate(parsed.processDateRaw);
    const processDateIso = proc ? proc.toISOString() : null;

    const match = matchAttRowToLrt(
      {
        attId: parsed.attId,
        dealerCode: parsed.dealerCode,
        officeName: parsed.officeName,
        leadTypeRaw: parsed.leadTypeRaw,
        submittedDate,
      },
      lrtRows,
    );

    const key = `${normalizeAttId(parsed.attId) || "row"}-${index}`;

    if (match.kind === "unmatched") {
      return {
        key,
        parsed,
        submittedDate,
        processDateIso,
        match: "unmatched",
        ambiguousCount: 0,
        lrt: null,
        mappedStatus: mapAttStatusToLrtStatus(parsed.attStatusRaw),
        skipStatus: isHoldPendingInfo(parsed.attStatusRaw),
        payload: { lrtId: "" },
        changeCount: 0,
        hasChanges: false,
      };
    }

    if (match.kind === "ambiguous") {
      return {
        key,
        parsed,
        submittedDate,
        processDateIso,
        match: "ambiguous",
        ambiguousCount: match.count,
        lrt: null,
        mappedStatus: mapAttStatusToLrtStatus(parsed.attStatusRaw),
        skipStatus: isHoldPendingInfo(parsed.attStatusRaw),
        payload: { lrtId: "" },
        changeCount: 0,
        hasChanges: false,
      };
    }

    const lrt = lrtRows.find((r) => r.id === match.lrtId) ?? null;
    if (!lrt) {
      return {
        key,
        parsed,
        submittedDate,
        processDateIso,
        match: "unmatched",
        ambiguousCount: 0,
        lrt: null,
        mappedStatus: undefined,
        skipStatus: false,
        payload: { lrtId: "" },
        changeCount: 0,
        hasChanges: false,
      };
    }

    const mappedStatus = mapAttStatusToLrtStatus(parsed.attStatusRaw);
    const skipStatus = isHoldPendingInfo(parsed.attStatusRaw);
    const payload = buildPayloadForRow(parsed, lrt, submittedDate, processDateIso);
    const changeCount = countFieldDiffs(lrt, payload, skipStatus, mappedStatus);
    const hasChanges = changeCount > 0;

    return {
      key,
      parsed,
      submittedDate,
      processDateIso,
      match: "matched",
      ambiguousCount: 0,
      lrt,
      mappedStatus,
      skipStatus,
      payload,
      changeCount,
      hasChanges,
    };
  });
}

function escapeCsvCell(v: string): string {
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function downloadUnmatchedCsv(rows: ParsedAttSheetRow[]) {
  const headers = [
    "Id",
    "Dealer Code",
    "Sub-Dealer",
    "Lead Request Type",
    "DMA",
    "State",
    "Submitted date",
    "Request Status",
    "Process Date",
    "RLM NOTES",
    "Notes",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsvCell(r.attId),
        escapeCsvCell(r.dealerCode),
        escapeCsvCell(r.officeName),
        escapeCsvCell(r.leadTypeRaw),
        escapeCsvCell(r.dma),
        escapeCsvCell(r.state),
        escapeCsvCell(String(r.submittedDateRaw ?? "")),
        escapeCsvCell(r.attStatusRaw),
        escapeCsvCell(String(r.processDateRaw ?? "")),
        escapeCsvCell(r.rlmNotes),
        escapeCsvCell(r.submitterNotes),
      ].join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "att-import-unmatched.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function AttImportView() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedAttSheetRow[]>([]);
  const [lrtRows, setLrtRows] = useState<LrtMatchRow[]>([]);
  const [lrtError, setLrtError] = useState<string | null>(null);
  const [lrtLoading, setLrtLoading] = useState(false);
  const [previewFilter, setPreviewFilter] = useState<PreviewFilter>("all");
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [importResult, setImportResult] = useState<{
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [unmatchedSnapshot, setUnmatchedSnapshot] = useState<ParsedAttSheetRow[]>([]);
  const [ambiguousAtApply, setAmbiguousAtApply] = useState(0);
  const [previewSession, setPreviewSession] = useState(0);
  const lrtFetchedSessionRef = useRef(-1);

  const [isPending, startTransition] = useTransition();

  const loadLrtRows = useCallback(async () => {
    setLrtLoading(true);
    setLrtError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lrt_lead_requests")
      .select(
        "id, dealer_code, dma, lead_type, lead_area_requested, created_at, status, att_confirmation_number, approved_zip_codes, denied_zip_codes, notes_for_icl, internal_notes, office, att_submitted_at, att_response_at",
      );
    if (error) {
      setLrtRows([]);
      setLrtError(error.message);
    } else {
      setLrtRows((data ?? []) as LrtMatchRow[]);
    }
    setLrtLoading(false);
  }, []);

  useEffect(() => {
    if (step !== 2 || parsedRows.length === 0 || lrtRows.length > 0 || lrtLoading) {
      return;
    }
    if (lrtFetchedSessionRef.current === previewSession) {
      return;
    }
    lrtFetchedSessionRef.current = previewSession;
    queueMicrotask(() => {
      void loadLrtRows();
    });
  }, [step, parsedRows.length, lrtRows.length, lrtLoading, loadLrtRows, previewSession]);

  const previewRows = useMemo(() => {
    if (parsedRows.length === 0 || lrtRows.length === 0) return [];
    return buildPreviewRows(parsedRows, lrtRows);
  }, [parsedRows, lrtRows]);

  useEffect(() => {
    if (step !== 2 || previewRows.length === 0) return;
    const next = new Set<string>();
    for (const pr of previewRows) {
      if (pr.match === "matched" && pr.hasChanges) {
        next.add(pr.key);
      }
    }
    queueMicrotask(() => {
      setCheckedKeys(next);
    });
  }, [step, previewSession, previewRows]);

  const statusBreakdown = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of parsedRows) {
      const k = r.attStatusRaw.trim() || "(blank)";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [parsedRows]);

  const summary = useMemo(() => {
    let matched = 0;
    let willUpdate = 0;
    let unmatched = 0;
    let noChange = 0;
    for (const pr of previewRows) {
      if (pr.match === "matched") {
        matched += 1;
        if (!pr.hasChanges) noChange += 1;
        else if (checkedKeys.has(pr.key)) willUpdate += 1;
      } else if (pr.match === "unmatched" || pr.match === "ambiguous") {
        unmatched += 1;
      }
    }
    return { matched, willUpdate, unmatched, noChange };
  }, [previewRows, checkedKeys]);

  const filteredPreview = useMemo(() => {
    return previewRows.filter((pr) => {
      if (previewFilter === "all") return true;
      if (previewFilter === "matched") return pr.match === "matched";
      if (previewFilter === "unmatched") return pr.match === "unmatched" || pr.match === "ambiguous";
      if (previewFilter === "no_change") return pr.match === "matched" && !pr.hasChanges;
      return true;
    });
  }, [previewRows, previewFilter]);

  function toggleKey(key: string) {
    setCheckedKeys((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  async function onFile(file: File | null) {
    setParseError(null);
    setParsedRows([]);
    setFileName("");
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setParseError("Please choose an Excel .xlsx file.");
      return;
    }
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    let workbook: XLSX.WorkBook;
    try {
      workbook = readWorkbookFromArrayBuffer(buf);
    } catch {
      setParseError("Could not read this Excel file.");
      return;
    }
    const result = parseNamRequestsSheet(workbook);
    if (!result.ok) {
      setParseError(result.error);
      return;
    }
    setParsedRows(result.rows);
  }

  function goPreview() {
    setPreviewSession((s) => s + 1);
    setStep(2);
    setPreviewFilter("all");
    setImportResult(null);
    setLrtError(null);
  }

  function applyUpdates() {
    const rows: AttImportRow[] = [];
    for (const pr of previewRows) {
      if (pr.match !== "matched" || !pr.hasChanges) continue;
      if (!checkedKeys.has(pr.key)) continue;
      rows.push(pr.payload);
    }
    const unmatched = previewRows.filter((p) => p.match === "unmatched").map((p) => p.parsed);
    setUnmatchedSnapshot(unmatched);
    setAmbiguousAtApply(previewRows.filter((p) => p.match === "ambiguous").length);
    setStep(3);
    setImportResult(null);
    startTransition(async () => {
      const res = await importAttReportAction(rows);
      if (!res.ok) {
        setImportResult({
          updated: 0,
          skipped: 0,
          errors: res.errors.length ? res.errors : ["Import could not be completed."],
        });
        return;
      }
      setImportResult({
        updated: res.updated,
        skipped: res.skipped,
        errors: res.errors,
      });
    });
  }

  const unknownLeadTypes = useMemo(() => {
    const u = new Set<string>();
    for (const r of parsedRows) {
      if (!mapAttLeadTypeToLrt(r.leadTypeRaw) && r.leadTypeRaw.trim()) {
        u.add(r.leadTypeRaw.trim());
      }
    }
    return Array.from(u);
  }, [parsedRows]);

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-transparent px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Import AT&amp;T Report</h1>
            <p className="mt-0.5 text-sm text-[var(--secondary)]">NAM REQUESTS sheet · territory team only</p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      {step === 1 ? (
        <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] px-[18px] py-3.5">
            <p className="text-[13px] font-semibold text-[var(--foreground)]">Step 1 — Upload</p>
            <p className="mt-1 text-[12px] text-[var(--muted)]">AT&amp;T D2D Dealer Leads Request Report (.xlsx)</p>
          </div>
          <div className="px-[18px] py-[18px]">
            <label className="inline-flex cursor-pointer flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Excel file</span>
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="text-[13px] text-[var(--foreground)] file:mr-3 file:rounded-[6px] file:border file:border-[var(--border)] file:bg-[var(--input)] file:px-3 file:py-2 file:text-sm file:text-[var(--foreground)]"
                onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {parseError ? (
              <p className="mt-4 rounded-[6px] border border-[#ef44444d] bg-[var(--card)] px-3 py-2 text-sm text-[var(--status-red)]">
                {parseError}
              </p>
            ) : null}
            {parsedRows.length > 0 ? (
              <div className="mt-6 space-y-4">
                <p className="text-[13px] text-[var(--secondary)]">
                  <span className="font-medium text-[var(--foreground)]">{fileName}</span>
                  <span className="text-[var(--muted)]"> · </span>
                  {parsedRows.length} row{parsedRows.length === 1 ? "" : "s"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusBreakdown.map(([label, count]) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-2.5 py-1 text-[12px] text-[var(--secondary)]"
                    >
                      <span className="font-medium text-[var(--foreground)]">{count}</span>
                      <span className="ml-1.5 text-[var(--muted)]">{label}</span>
                    </span>
                  ))}
                </div>
                {unknownLeadTypes.length > 0 ? (
                  <p className="text-[12px] text-[var(--status-amber)]">
                    Unmapped lead types (matching may be limited): {unknownLeadTypes.slice(0, 5).join("; ")}
                    {unknownLeadTypes.length > 5 ? "…" : ""}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={goPreview}
                  className="inline-flex h-10 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
                >
                  Continue to Preview
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-[18px] py-3.5">
              <p className="text-[13px] font-semibold text-[var(--foreground)]">Step 2 — Preview</p>
            </div>
            <div className="px-[18px] py-4">
              {lrtError ? (
                <p className="text-sm text-[var(--status-red)]">{lrtError}</p>
              ) : (
                <p className="text-[13px] text-[var(--secondary)]">
                  <span className="font-medium text-[var(--foreground)]">{summary.matched}</span> records matched
                  <span className="text-[var(--muted)]"> · </span>
                  <span className="font-medium text-[var(--accent)]">{summary.willUpdate}</span> will be updated
                  <span className="text-[var(--muted)]"> · </span>
                  <span className="font-medium text-[var(--status-amber)]">{summary.unmatched}</span> new (no DB match)
                  <span className="text-[var(--muted)]"> · </span>
                  <span className="font-medium text-[var(--muted)]">{summary.noChange}</span> already up to date
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "matched", "unmatched", "no_change"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPreviewFilter(f)}
                className={`inline-flex min-h-8 items-center rounded-[6px] border px-3 py-[7px] text-[12px] transition-colors ${
                  previewFilter === f
                    ? "border-[rgba(79,124,255,0.3)] bg-[var(--blue-bg)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--input)] text-[var(--secondary)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "matched"
                    ? "Matched"
                    : f === "unmatched"
                      ? "New records"
                      : "No Change"}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
            <div className="max-h-[min(560px,60vh)] overflow-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="sticky top-0 z-[1] border-b border-[var(--border)] bg-[var(--card)]">
                    <th className="w-10 py-[10px] pl-[14px] pr-0 text-left">
                      <span className="sr-only">Include</span>
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      Office
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      Dealer
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      DMA
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      Lead Type
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      Submitted
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      AT&amp;T Decision
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      LRT Status Change
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      Fields updated
                    </th>
                    <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                      Match
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lrtLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-[13px] text-[var(--muted)]">
                        Loading requests…
                      </td>
                    </tr>
                  ) : null}
                  {!lrtLoading && filteredPreview.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-[13px] text-[var(--muted)]">
                        No rows in this filter.
                      </td>
                    </tr>
                  ) : null}
                  {!lrtLoading
                    ? filteredPreview.map((pr) => {
                        const grey = pr.match === "matched" && !pr.hasChanges;
                        const showCheck =
                          pr.match === "matched" && pr.hasChanges && pr.lrt;
                        const newStatus = pr.skipStatus
                          ? pr.lrt?.status
                          : pr.mappedStatus ?? pr.lrt?.status;
                        const statusLine =
                          pr.lrt && newStatus
                            ? `${statusLabel(pr.lrt.status)} → ${statusLabel(newStatus)}`
                            : "—";
                        const terminal =
                          newStatus && TERMINAL.has(newStatus as LeadRequestStatus)
                            ? "text-[var(--status-green)]"
                            : "text-[var(--status-amber)]";

                        const changedFields =
                          pr.match === "matched" && pr.lrt
                            ? listChangedDbFields(pr.lrt, pr.payload, pr.skipStatus, pr.mappedStatus)
                            : [];
                        const fieldsTooltip =
                          changedFields.length > 0 ? changedFields.join(", ") : undefined;

                        return (
                          <tr
                            key={pr.key}
                            className={`border-b border-[var(--border)] last:border-b-0 ${
                              grey ? "opacity-50" : ""
                            }`}
                          >
                            <td className="py-[11px] pl-[14px] pr-0">
                              {showCheck ? (
                                <input
                                  type="checkbox"
                                  checked={checkedKeys.has(pr.key)}
                                  onChange={() => toggleKey(pr.key)}
                                  className="h-[14px] w-[14px] accent-[var(--accent)]"
                                />
                              ) : (
                                <span className="inline-block w-[14px]" />
                              )}
                            </td>
                            <td className="px-[14px] py-[11px] text-[13px] text-[var(--foreground)]">
                              {pr.parsed.officeName || "—"}
                            </td>
                            <td className="px-[14px] py-[11px] font-mono text-[12px] text-[var(--secondary)]">
                              {pr.parsed.dealerCode || "—"}
                            </td>
                            <td className="px-[14px] py-[11px] text-[13px] text-[var(--secondary)]">
                              {pr.parsed.dma || "—"}
                            </td>
                            <td className="px-[14px] py-[11px]">
                              <span className="lrt-lead-type text-[13px] text-[var(--foreground)]">
                                {pr.lrt
                                  ? formatLeadType(pr.lrt.lead_type)
                                  : mapAttLeadTypeToLrt(pr.parsed.leadTypeRaw)
                                    ? formatLeadType(mapAttLeadTypeToLrt(pr.parsed.leadTypeRaw)!)
                                    : pr.parsed.leadTypeRaw || "—"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-[14px] py-[11px] font-mono text-[11px] text-[var(--muted)]">
                              {formatSubmitted(pr.submittedDate)}
                            </td>
                            <td className="px-[14px] py-[11px] text-[12px] text-[var(--foreground)]">
                              {pr.parsed.attStatusRaw || "—"}
                            </td>
                            <td className={`px-[14px] py-[11px] text-[12px] font-medium ${pr.lrt ? terminal : ""}`}>
                              {pr.lrt ? statusLine : "—"}
                            </td>
                            <td className="px-[14px] py-[11px]">
                              {pr.match === "matched" ? (
                                <span
                                  className="inline-flex min-w-[1.5rem] cursor-help items-center justify-center rounded-[20px] bg-[var(--bg4)] px-2 py-0.5 text-[11px] font-medium text-[var(--foreground)]"
                                  title={fieldsTooltip}
                                  aria-label={
                                    fieldsTooltip
                                      ? `Fields updated: ${fieldsTooltip}`
                                      : pr.hasChanges
                                        ? "Fields updated"
                                        : "No field changes"
                                  }
                                >
                                  {pr.changeCount}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-[14px] py-[11px]">
                              {pr.match === "matched" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--status-green)]">
                                  <span aria-hidden>✅</span> Matched
                                </span>
                              ) : pr.match === "ambiguous" ? (
                                <span className="inline-flex rounded-[6px] border border-[#ef44444d] bg-[var(--input)] px-2 py-0.5 text-[11px] font-medium text-[var(--status-red)]">
                                  Ambiguous ({pr.ambiguousCount})
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 rounded-[6px] border border-[var(--status-amber)]/40 bg-[var(--input)] px-2 py-0.5 text-[11px] font-medium text-[var(--status-amber)]"
                                  title="No matching request — not included in apply"
                                >
                                  <span aria-hidden>⚠️</span> New record
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setLrtRows([]);
                lrtFetchedSessionRef.current = -1;
              }}
              className="inline-flex h-10 items-center rounded-[6px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
            >
              Back
            </button>
            <button
              type="button"
              disabled={lrtLoading || !!lrtError || isPending}
              onClick={() => applyUpdates()}
              className="inline-flex h-10 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply Updates
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] px-[18px] py-3.5">
            <p className="text-[13px] font-semibold text-[var(--foreground)]">Step 3 — Result</p>
          </div>
          <div className="space-y-4 px-[18px] py-[18px]">
            {isPending ? (
              <p className="text-[13px] text-[var(--secondary)]">Applying updates…</p>
            ) : importResult ? (
              <>
                {importResult.errors.length > 0 && importResult.updated === 0 && importResult.skipped === 0 ? (
                  <p className="text-[15px] font-medium text-[var(--status-red)]">Import did not complete</p>
                ) : (
                  <p className="text-[15px] font-medium text-[var(--status-green)]">
                    ✓ {importResult.updated} record{importResult.updated === 1 ? "" : "s"} updated successfully
                  </p>
                )}
                <p className="text-[13px] text-[var(--secondary)]">
                  {importResult.skipped} record{importResult.skipped === 1 ? " was" : "s were"} already up to date
                  (skipped)
                </p>
                <p className="text-[13px] text-[var(--secondary)]">
                  {unmatchedSnapshot.length} row{unmatchedSnapshot.length === 1 ? "" : "s"} had no matching request (not
                  included in apply)
                </p>
                {ambiguousAtApply > 0 ? (
                  <p className="text-[13px] text-[var(--secondary)]">
                    {ambiguousAtApply} record{ambiguousAtApply === 1 ? "" : "s"} had multiple possible matches
                    (ambiguous)
                  </p>
                ) : null}
                {importResult.errors.length > 0 ? (
                  <ul className="list-inside list-disc text-[13px] text-[var(--status-red)]">
                    {importResult.errors.slice(0, 12).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {importResult.errors.length > 12 ? <li>…</li> : null}
                  </ul>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-2">
                  {unmatchedSnapshot.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => downloadUnmatchedCsv(unmatchedSnapshot)}
                      className="inline-flex h-10 items-center rounded-[6px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
                    >
                      Download new-record rows as CSV
                    </button>
                  ) : null}
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[var(--muted)]">Preparing…</p>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
