"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { cancelImport } from "@/app/imports/actions";
import { ImportRowExpansion } from "@/components/imports/import-row-expansion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLrtPublicId } from "@/lib/import/display-id";
import { formatRelativeTime } from "@/lib/format-relative";
import { formatLeadType, formatShortDate } from "@/lib/lead-requests/presentation";
import type { ImportPreviewRow, ImportRunWithUploader } from "@/types/import";
import type { LeadRequestStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

import { CommitImportDialog } from "./commit-dialog";

const STATUS_LABEL: Record<LeadRequestStatus, string> = {
  new: "New",
  submitted_to_client: "Submitted to AT&T",
  leads_received: "Leads Received",
  visible_in_salesforce: "Visible in SF",
  declined: "Declined",
  market_proposal_answered: "Market Proposal",
  leads_pulled_back: "Pulled Back",
};

function statusLabel(s: string): string {
  return STATUS_LABEL[s as LeadRequestStatus] ?? s;
}

type FilterKey = "all" | "matched" | "new" | "unchanged" | "ambiguous" | "error";

function matchesFilter(row: ImportPreviewRow, f: FilterKey): boolean {
  if (f === "all") return true;
  const ms = row.match_status;
  if (f === "matched") return ms === "matched";
  if (f === "new") return ms === "new";
  if (f === "unchanged") return ms === "unchanged";
  if (f === "ambiguous") return ms === "ambiguous_unresolved" || ms === "ambiguous_resolved";
  if (f === "error") return ms === "error";
  return true;
}

export function PreviewClient({
  importData,
  rows,
  profileNames,
}: {
  importData: ImportRunWithUploader;
  rows: ImportPreviewRow[];
  profileNames: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = (searchParams.get("filter") as FilterKey) || "all";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commitOpen, setCommitOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (searchParams.get("committed") === "true") {
      toast.success("Import committed.");
      router.replace(`/imports/${importData.id}`, { scroll: false });
    }
  }, [searchParams, router, importData.id]);

  const setFilter = useCallback(
    (next: FilterKey) => {
      const q = new URLSearchParams(searchParams.toString());
      if (next === "all") q.delete("filter");
      else q.set("filter", next);
      router.replace(`/imports/${importData.id}?${q.toString()}`);
    },
    [router, searchParams, importData.id],
  );

  const counts = useMemo(() => {
    const tally = (ms: string) => rows.filter((r) => r.match_status === ms).length;
    const matchedGreen = tally("matched") + tally("unchanged") + tally("ambiguous_resolved");
    return {
      matched: matchedGreen,
      updated: tally("matched"),
      new: tally("new"),
      unchanged: tally("unchanged"),
      ambiguous: tally("ambiguous_unresolved") + tally("ambiguous_resolved"),
      ambiguousUnresolved: tally("ambiguous_unresolved"),
      error: tally("error"),
    };
  }, [rows]);

  const filtered = useMemo(() => rows.filter((r) => matchesFilter(r, filter)), [rows, filter]);

  const applyCount = useMemo(() => {
    return rows.filter((r) =>
      ["matched", "new", "ambiguous_resolved"].includes(r.match_status),
    ).length;
  }, [rows]);

  const isPreview = importData.status === "preview";

  async function onCancelImport() {
    setCancelling(true);
    const res = await cancelImport(importData.id);
    setCancelling(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Import cancelled.");
    router.push("/imports");
    router.refresh();
  }

  const subtitle = [
    importData.sheet_name || "Sheet",
    importData.file_name || "—",
    `uploaded ${formatRelativeTime(importData.created_at)} by ${importData.uploader_name ?? "—"}`,
  ].join(" · ");

  return (
    <div className="pb-32">
      <div className="mb-6">
        <Link
          href="/imports"
          className="text-[13px] font-medium text-[var(--accent)] hover:underline"
        >
          ← Imports
        </Link>
        <h1 className="mt-3 text-[20px] font-semibold tracking-tight text-[var(--foreground)]">
          Import AT&amp;T Report
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">{subtitle}</p>
      </div>

      <div className="mb-6 rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Step 2 — Preview</p>
        <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[13px]">
          <span>
            <span className="font-mono text-[var(--green)]">{counts.matched}</span>{" "}
            <span className="text-[var(--green)]">matched</span>
          </span>
          <span className="text-[var(--muted)]">·</span>
          <span>
            <span className="font-mono text-[var(--accent)]">{counts.updated}</span>{" "}
            <span className="text-[var(--accent)]">will be updated</span>
          </span>
          <span className="text-[var(--muted)]">·</span>
          <span>
            <span className="font-mono text-[var(--amber)]">{counts.new}</span>{" "}
            <span className="text-[var(--amber)]">new</span>
          </span>
          <span className="text-[var(--muted)]">·</span>
          <span>
            <span className="font-mono text-[var(--muted)]">{counts.unchanged}</span>{" "}
            <span className="text-[var(--secondary)]">already up to date</span>
          </span>
          <span className="text-[var(--muted)]">·</span>
          <span>
            <span className="font-mono text-[var(--red)]">{counts.ambiguousUnresolved}</span>{" "}
            <span className="text-[var(--red)]">ambiguous</span>
          </span>
          <span className="text-[var(--muted)]">·</span>
          <span>
            <span className="font-mono text-[var(--amber)]">{counts.error}</span>{" "}
            <span className="text-[var(--amber)]">errors</span>
          </span>
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["matched", "Matched"],
            ["new", "New records"],
            ["error", `Errors (${counts.error})`],
            ["unchanged", "No Change"],
            ["ambiguous", `Ambiguous (${counts.ambiguousUnresolved})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
              filter === key
                ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)] shadow-[0_0_0_1px_rgba(79,124,255,0.25)]"
                : "border-[var(--border)] bg-[var(--input)] text-[var(--secondary)] hover:border-[var(--border-hover)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Office</TableHead>
              <TableHead>Dealer</TableHead>
              <TableHead>DMA</TableHead>
              <TableHead>Lead Type</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>AT&amp;T Decision</TableHead>
              <TableHead>LRT Status Change</TableHead>
              <TableHead>Fields Updated</TableHead>
              <TableHead>Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <PreviewTableRow
                key={row.id}
                row={row}
                expanded={expandedId === row.id}
                onToggleExpand={() => setExpandedId((cur) => (cur === row.id ? null : row.id))}
                onCollapse={() => setExpandedId(null)}
                onResolved={() => {
                  setExpandedId(null);
                  router.refresh();
                }}
                profileNames={profileNames}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {isPreview ? (
        <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--card)] px-6 py-4 md:left-[240px]">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-[var(--muted)]">
              {applyCount} row{applyCount === 1 ? "" : "s"} to apply · {counts.ambiguousUnresolved} ambiguous ·{" "}
              {counts.error} errors
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={onCancelImport}
                className="rounded-[6px] px-4 py-2 text-[13px] text-[var(--secondary)] hover:bg-[var(--input)]"
              >
                {cancelling ? "…" : "Cancel Import"}
              </button>
              <button
                type="button"
                onClick={() => setCommitOpen(true)}
                className="rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-5 py-2 text-[13px] font-medium text-white"
              >
                Apply Import
              </button>
            </div>
          </div>
        </footer>
      ) : null}

      <CommitImportDialog
        open={commitOpen}
        onOpenChange={setCommitOpen}
        importId={importData.id}
        applyCount={applyCount}
        ambiguousUnresolved={counts.ambiguousUnresolved}
        errorRows={counts.error}
      />
    </div>
  );
}

function PreviewTableRow({
  row,
  expanded,
  onToggleExpand,
  onCollapse,
  onResolved,
  profileNames,
}: {
  row: ImportPreviewRow;
  expanded: boolean;
  onToggleExpand: () => void;
  onCollapse: () => void;
  onResolved: () => void;
  profileNames: Record<string, string>;
}) {
  const dec = (row.att_decision ?? "").toUpperCase();
  const decisionClass =
    dec.includes("APPROVE") || dec === "APPROVED"
      ? "text-[var(--green)]"
      : dec.includes("DEN") || dec === "DENIED"
        ? "text-[var(--red)]"
        : "text-[var(--foreground)]";

  const prev = row.preview.prev_status;
  const next = row.preview.next_status;
  const statusLine =
    prev && next && row.preview.status_will_change ? (
      <span className="text-[11px] text-[var(--secondary)]">
        {statusLabel(prev)} → {statusLabel(next)}
      </span>
    ) : (
      "—"
    );

  const fields =
    row.preview.field_count > 0 ? (
      <span
        title={row.preview.field_names.join(", ")}
        className="cursor-help rounded-full bg-[var(--bg4)] px-2 py-0.5 font-mono text-[10px] text-[var(--foreground)]"
      >
        +{row.preview.field_count} fields
      </span>
    ) : (
      "—"
    );

  return (
    <>
      <TableRow>
        <TableCell className="max-w-[140px] text-[13px] text-[var(--foreground)]">{row.office}</TableCell>
        <TableCell className="font-mono text-[12px] text-[var(--secondary)]">{row.dealer_code}</TableCell>
        <TableCell className="text-[13px]">{row.dma}</TableCell>
        <TableCell>
          <span className="inline-block rounded bg-[var(--bg4)] px-2 py-0.5 font-mono text-[10px]">
            {formatLeadType(row.lead_type ?? "")}
          </span>
        </TableCell>
        <TableCell className="font-mono text-[12px] text-[var(--secondary)]">
          {row.submitted_date ? formatShortDate(row.submitted_date) : "—"}
        </TableCell>
        <TableCell className={cn("font-mono text-[12px]", decisionClass)}>{dec || "—"}</TableCell>
        <TableCell>{statusLine}</TableCell>
        <TableCell>{fields}</TableCell>
        <TableCell>
          <MatchCell
            row={row}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
          />
        </TableCell>
      </TableRow>
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={9} className="p-0">
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-[250ms] ease-out",
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              {expanded ? (
                row.match_status === "error" ? (
                  <ImportRowExpansion
                    row={row}
                    profileNames={profileNames}
                    mode="error"
                    onChanged={onResolved}
                    onCancel={onCollapse}
                  />
                ) : row.match_status === "ambiguous_unresolved" ? (
                  <ImportRowExpansion
                    row={row}
                    profileNames={profileNames}
                    mode="ambiguous"
                    onChanged={onResolved}
                    onCancel={onCollapse}
                  />
                ) : null
              ) : null}
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

function MatchCell({
  row,
  expanded,
  onToggleExpand,
}: {
  row: ImportPreviewRow;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const ms = row.match_status;
  if (ms === "matched" && row.linked_request_id && row.linked_request) {
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--green)]/40 bg-[var(--green-bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--green)]">
        Matched · {formatLrtPublicId(row.linked_request)}
      </span>
    );
  }
  if (ms === "new") {
    return (
      <span className="inline-flex rounded-full border border-[var(--amber)]/50 bg-[var(--amber-bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--amber)]">
        New record
      </span>
    );
  }
  if (ms === "unchanged") {
    return (
      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--input)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">
        No change
      </span>
    );
  }
  if (ms === "ambiguous_unresolved") {
    return (
      <button
        type="button"
        onClick={onToggleExpand}
        className={cn(
          "inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors",
          expanded
            ? "border-[var(--red)] bg-[var(--red-bg)] text-[var(--red)]"
            : "border-[var(--red)]/50 bg-[var(--red-bg)] text-[var(--red)] hover:brightness-110",
        )}
      >
        Ambiguous ({row.candidates.length})
      </button>
    );
  }
  if (ms === "ambiguous_resolved" && row.linked_request_id && row.linked_request) {
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--green)]/40 bg-[var(--green-bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--green)]">
        Resolved · {formatLrtPublicId(row.linked_request)}
      </span>
    );
  }
  if (ms === "error") {
    return (
      <button
        type="button"
        onClick={onToggleExpand}
        className="inline-flex rounded-full border border-[var(--amber)] bg-[var(--amber-bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--amber)]"
      >
        Error
      </button>
    );
  }
  if (ms === "error_deleted" || ms === "ambiguous_deleted") {
    return <span className="text-[11px] text-[var(--muted)]">Deleted</span>;
  }
  if (ms === "applied") {
    return <span className="text-[11px] text-[var(--muted)]">Applied</span>;
  }
  return <span className="font-mono text-[10px] text-[var(--muted)]">{ms}</span>;
}
