"use client";

import { useState } from "react";
import { toast } from "sonner";

import { deleteAmbiguousRow, resolveAmbiguousRow } from "@/app/imports/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatLrtPublicId } from "@/lib/import/display-id";
import { formatLeadArea, formatShortDate } from "@/lib/lead-requests/presentation";
import type { ImportPreviewRow } from "@/types/import";
import type { Tables } from "@/types/database";
import { cn } from "@/lib/utils";

import { normalizeString } from "@/lib/import/normalize";

function leadAreaFromIncoming(lead_area: string | null): string {
  return (lead_area ?? "").trim();
}

function daysLabel(incomingDate: string | null, req: Tables<"lrt_lead_requests">): string {
  if (!incomingDate || incomingDate.length < 10) return "";
  const inc = incomingDate.slice(0, 10);
  const sub = req.att_submitted_at ? req.att_submitted_at.slice(0, 10) : req.created_at.slice(0, 10);
  const a = new Date(`${inc}T12:00:00Z`).getTime();
  const b = new Date(`${sub}T12:00:00Z`).getTime();
  const diff = Math.round((a - b) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "same day";
  if (diff > 0) return `${diff}d after`;
  return `${-diff}d before`;
}

type Props = {
  row: ImportPreviewRow;
  profileNames: Record<string, string>;
  onChanged: () => void;
  onCancel?: () => void;
  mode: "ambiguous" | "error";
};

export function ImportRowExpansion({ row, profileNames, onChanged, onCancel, mode }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const candidates = row.candidates;
  const n = candidates.length;

  async function onLink() {
    if (!selected) return;
    setLinking(true);
    const res = await resolveAmbiguousRow(row.id, selected);
    setLinking(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Linked to lead request.");
    onChanged();
  }

  async function onDelete() {
    setDeleting(true);
    const res = await deleteAmbiguousRow(row.id, deleteReason || undefined);
    setDeleting(false);
    setDeleteOpen(false);
    setDeleteReason("");
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success(mode === "error" ? "Row removed." : "Row deleted.");
    onChanged();
  }

  const incomingOffice = row.office ?? "";
  const incomingDealer = row.dealer_code ?? "";
  const incomingDma = row.dma ?? "";
  const incomingLead = row.lead_type ?? "";
  const incomingArea = leadAreaFromIncoming(row.lead_area);

  if (mode === "error") {
    return (
      <div className="space-y-4 border-t border-[var(--border)] bg-[var(--background)] px-4 py-4">
        <div className="rounded-[10px] border border-dashed border-[var(--amber)] bg-[var(--card)] p-4">
          <span className="inline-block rounded bg-[var(--amber-bg)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-[var(--amber)]">
            Incoming
          </span>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] text-[var(--foreground)]">
            <span>{incomingOffice}</span>
            <span>{incomingDealer}</span>
            <span>{incomingDma}</span>
            <span>{incomingLead}</span>
          </div>
        </div>
        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[13px] text-[var(--foreground)]">
          {row.error_message ?? "Unknown error."}
        </div>
        <p className="text-[12px] text-[var(--secondary)]">
          Create or activate the owner profile for{" "}
          <span className="font-mono text-[var(--foreground)]">{incomingOffice}</span> /{" "}
          <span className="font-mono text-[var(--foreground)]">{incomingDealer}</span>, then re-run this import. The
          row will be skipped on commit.
        </p>
        <div className="flex justify-end gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-[6px] px-3 py-2 text-[13px] text-[var(--secondary)] hover:bg-[var(--input)]"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-[6px] px-3 py-2 text-[13px] text-[var(--red)] hover:bg-[var(--red-bg)]"
          >
            Delete Row
          </button>
        </div>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this row?</AlertDialogTitle>
              <AlertDialogDescription>Optional reason (stored internally).</AlertDialogDescription>
            </AlertDialogHeader>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="mt-2 min-h-[72px] w-full rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[13px] text-[var(--foreground)]"
              placeholder="Reason…"
            />
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <button
                type="button"
                disabled={deleting}
                onClick={onDelete}
                className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[var(--red)] px-4 text-sm font-medium text-white"
              >
                {deleting ? "…" : "Delete"}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-[var(--border)] bg-[var(--background)] px-4 py-4">
      <div>
        <p className="text-[14px] font-medium text-[var(--foreground)]">
          Pick the LRT request this AT&amp;T decision belongs to
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">
          {n} candidate{n === 1 ? "" : "s"} within ±3 days
        </p>
      </div>

      <div className="rounded-[10px] border border-dashed border-[var(--amber)] bg-[var(--card)] p-4">
        <span className="inline-block rounded bg-[var(--amber-bg)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-[var(--amber)]">
          Incoming
        </span>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] text-[var(--foreground)]">
          <span>{incomingOffice}</span>
          <span>{incomingDealer}</span>
          <span>{incomingDma}</span>
          <span>{incomingLead}</span>
          <span>{formatLeadArea(incomingArea)}</span>
        </div>
      </div>

      <div className="space-y-2">
        {candidates.map((c) => {
          const id = formatLrtPublicId(c);
          const matchOffice = normalizeString(c.office ?? "") === normalizeString(incomingOffice);
          const matchDealer = normalizeString(c.dealer_code ?? "") === normalizeString(incomingDealer);
          const matchDma = normalizeString(c.dma ?? "") === normalizeString(incomingDma);
          const matchLt = (c.lead_type ?? "") === incomingLead;
          const picked = selected === c.id;
          return (
            <label
              key={c.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-3 transition-colors",
                picked && "border-[var(--accent)] bg-[var(--accent-glow)]",
              )}
            >
              <div className="flex shrink-0 items-start pt-0.5">
                <input
                  type="radio"
                  name={`pick-${row.id}`}
                  checked={picked}
                  onChange={() => setSelected(c.id)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                    picked
                      ? "border-[var(--accent)] bg-[var(--accent)]"
                      : "border-[var(--muted)] bg-transparent",
                  )}
                  aria-hidden
                >
                  {picked ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-mono text-[13px] font-medium text-[var(--accent)]">{id}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px]">
                  <span className={matchOffice ? "text-[var(--green)]" : "text-[var(--amber)]"}>{c.office}</span>
                  <span className={matchDealer ? "text-[var(--green)]" : "text-[var(--amber)]"}>
                    {c.dealer_code}
                  </span>
                  <span className={matchDma ? "text-[var(--green)]" : "text-[var(--amber)]"}>{c.dma}</span>
                  <span className={matchLt ? "text-[var(--green)]" : "text-[var(--amber)]"}>{c.lead_type}</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  {formatShortDate(c.att_submitted_at ?? c.created_at)} · {daysLabel(row.submitted_date, c)}
                  {profileNames[c.submitted_by] ? ` · ${profileNames[c.submitted_by]}` : ""}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[6px] px-3 py-2 text-[13px] text-[var(--secondary)] hover:bg-[var(--input)]"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="rounded-[6px] px-3 py-2 text-[13px] text-[var(--red)] hover:bg-[var(--red-bg)]"
        >
          Delete Row
        </button>
        <button
          type="button"
          disabled={!selected || linking}
          onClick={onLink}
          className="inline-flex h-10 min-w-[160px] items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {linking
            ? "…"
            : (() => {
                const sel = selected ? candidates.find((c) => c.id === selected) : undefined;
                return sel ? `Link to ${formatLrtPublicId(sel)}` : "Link";
              })()}
        </button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ambiguous row?</AlertDialogTitle>
            <AlertDialogDescription>Optional reason (stored internally).</AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="mt-2 min-h-[72px] w-full rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[13px] text-[var(--foreground)]"
            placeholder="Reason…"
          />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[var(--red)] px-4 text-sm font-medium text-white"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
