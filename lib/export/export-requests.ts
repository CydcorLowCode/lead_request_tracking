import * as XLSX from "xlsx";

import { formatLeadType } from "@/lib/lead-requests/presentation";
import type { Tables } from "@/types/database";

export type ExportProfile = {
  full_name: string | null;
  email: string;
};

const STATUS_EXPORT_LABELS: Record<string, string> = {
  new: "New",
  submitted_to_client: "Submitted to AT&T",
  leads_received: "Leads Received by Cydcor",
  visible_in_salesforce: "Visible in Salesforce",
  declined: "Declined",
  market_proposal_answered: "Market Proposal Answered",
  leads_pulled_back: "Leads Pulled Back by Client",
};

const EXPORT_HEADERS = [
  "Request ID",
  "Submitted",
  "Owner",
  "Dealer Code",
  "Lead Type",
  "Status",
  "Lead Area",
  "DMA",
  "Office",
  "Dealer Code",
  "Company Reserves",
  "AT&T Confirmation #",
  "SLA Due",
  "Date Needed By",
  "Internal Notes",
  "Notes for ICL",
] as const;

function formatExportDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: string): string {
  return STATUS_EXPORT_LABELS[status] ?? "Unknown";
}

function defaultBasename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `lrt-export-${y}-${m}-${day}`;
}

function buildAoa(
  rows: Tables<"lrt_lead_requests">[],
  profileMap: Map<string, ExportProfile>,
): string[][] {
  const dataRows = rows.map((row) => {
    const owner = profileMap.get(row.owner_id);
    const ownerLabel = owner?.full_name ?? owner?.email ?? "Unknown";
    const dealer = row.dealer_code ?? "";

    return [
      row.id.slice(0, 8),
      formatExportDate(row.created_at),
      ownerLabel,
      dealer,
      formatLeadType(row.lead_type),
      statusLabel(row.status),
      row.lead_area_requested,
      row.dma ?? "",
      row.office ?? "",
      dealer,
      row.is_reserve ? "Yes" : "No",
      row.att_confirmation_number ?? "",
      formatExportDate(row.sla_due_at),
      formatExportDate(row.date_needed_by),
      row.internal_notes ?? "",
      row.notes_for_icl ?? "",
    ];
  });

  return [[...EXPORT_HEADERS], ...dataRows];
}

function computeColWidths(aoa: string[][]): XLSX.ColInfo[] {
  if (aoa.length === 0) {
    return [];
  }
  const colCount = aoa[0]?.length ?? 0;
  const maxLens = Array.from({ length: colCount }, () => 0);

  for (const row of aoa) {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length;
      if (len > maxLens[i]) {
        maxLens[i] = len;
      }
    });
  }

  return maxLens.map((len) => ({ wch: Math.min(60, Math.max(len, 1)) }));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type ExportLeadRequestsOptions = {
  format: "csv" | "xlsx";
  filename?: string;
};

export function exportLeadRequests(
  rows: Tables<"lrt_lead_requests">[],
  profileMap: Map<string, ExportProfile>,
  options: ExportLeadRequestsOptions,
): void {
  if (rows.length === 0) {
    return;
  }

  const aoa = buildAoa(rows, profileMap);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = computeColWidths(aoa);

  const base = options.filename?.replace(/\.(csv|xlsx)$/i, "") ?? defaultBasename();

  if (options.format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${base}.csv`);
    return;
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Requests");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, `${base}.xlsx`);
}
