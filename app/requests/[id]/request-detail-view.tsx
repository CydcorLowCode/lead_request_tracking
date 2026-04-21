"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { SlaChip } from "@/components/requests/sla-chip";
import { StatusBadge } from "@/components/requests/status-badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  buildSlaWarningLookup,
  getWarningHoursForRequest,
  toLeadRequestStatus,
  type LeadRequestRow,
} from "@/lib/lead-requests/presentation";
import { evaluateSlaStatus } from "@/lib/sla/evaluate";
import type { Tables } from "@/types/database";
import { LEAD_REQUEST_STATUSES } from "@/types/enums";
import { deleteLeadRequestAction, updateLeadRequestAction } from "./actions";

type SlaConfigRow = Pick<Tables<"lrt_sla_configs">, "campaign_id" | "lead_type" | "warning_hours">;
type AuditRow = Tables<"lrt_audit_log">;
type ProfileRow = Pick<Tables<"lrt_profiles">, "id" | "full_name" | "email" | "role">;

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  submitted_to_client: "Submitted to AT&T",
  leads_received: "Leads Received by Cydcor",
  visible_in_salesforce: "Visible in Salesforce",
  declined: "Declined",
  market_proposal_answered: "Market Proposal Answered",
  leads_pulled_back: "Leads Pulled Back by Client",
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function formatLeadTypeLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function CopyValueButton({
  text,
  ariaLabel,
  alwaysVisible = false,
}: {
  text: string;
  ariaLabel: string;
  /** When true, render a disabled Copy control when there is nothing to copy (e.g. empty form field). */
  alwaysVisible?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const trimmed = text.trim();
  const empty = !trimmed || trimmed === "—";
  if (empty && !alwaysVisible) return null;

  return (
    <button
      type="button"
      disabled={empty}
      title={empty ? "Nothing to copy yet" : undefined}
      onClick={async () => {
        if (empty) return;
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Could not copy to clipboard.");
        }
      }}
      className="inline-flex h-7 shrink-0 items-center rounded-[6px] border border-[var(--border)] bg-transparent px-2 text-[10px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--muted)]"
      aria-label={`Copy ${ariaLabel}`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function AuditEntry({ entry, currentUserId }: { entry: AuditRow; currentUserId: string }) {
  const isSystem = !entry.changed_by;
  const isMe = entry.changed_by === currentUserId;
  const actor = isSystem ? "System" : isMe ? "You" : "Territory Team";

  let description = "Made a change";
  if (entry.field_name === "status") {
    description = `Status changed: ${STATUS_LABELS[entry.old_value ?? ""] ?? entry.old_value ?? "—"} → ${STATUS_LABELS[entry.new_value ?? ""] ?? entry.new_value ?? "—"}`;
  } else if (entry.field_name === "att_confirmation_number") {
    description = entry.new_value
      ? `AT&T confirmation # set to ${entry.new_value}`
      : "AT&T confirmation # cleared";
  } else if (entry.field_name === "approved_zip_codes") {
    description = entry.new_value
      ? "Approved zip codes updated"
      : "Approved zip codes cleared";
  } else if (entry.field_name === "denied_zip_codes") {
    description = entry.new_value
      ? "Denied zip codes updated"
      : "Denied zip codes cleared";
  } else if (entry.field_name === "notes_for_icl") {
    description = entry.new_value ? "Notes for ICL updated" : "Notes for ICL cleared";
  } else if (entry.field_name) {
    description = `${entry.field_name} updated`;
  }

  return (
    <div className="flex gap-2.5 border-b border-[var(--border)] py-2.5 last:border-b-0">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
      <div>
        <p className="text-[12px] leading-relaxed text-[var(--secondary)]">{description}</p>
        <p className="mt-0.5 font-mono text-[11px] text-[var(--muted)]">
          {actor} · {formatDateTime(entry.changed_at)}
        </p>
      </div>
    </div>
  );
}

export function RequestDetailView({
  row,
  ownerProfile,
  auditLog,
  slaConfigs,
  currentProfile,
}: {
  row: LeadRequestRow;
  ownerProfile: ProfileRow | null;
  auditLog: AuditRow[];
  slaConfigs: SlaConfigRow[];
  currentProfile: ProfileRow;
}) {
  const warningLookup = buildSlaWarningLookup(slaConfigs);
  const status = toLeadRequestStatus(row.status);
  const sla = evaluateSlaStatus({
    status,
    slaDueAt: row.sla_due_at,
    warningHours: getWarningHoursForRequest(row, warningLookup),
  });

  const isTerritoryTeam = currentProfile.role === "territory_team";
  const isOwnerViewer =
    currentProfile.role === "owner" && currentProfile.id === row.owner_id;
  const router = useRouter();

  // Form state
  const [formStatus, setFormStatus] = useState(row.status);
  const [attConfirmationNumber, setAttConfirmationNumber] = useState(row.att_confirmation_number ?? "");
  const [internalNotes, setInternalNotes] = useState(row.internal_notes ?? "");
  const [notesForIcl, setNotesForIcl] = useState(row.notes_for_icl ?? "");
  const [approvedZipCodes, setApprovedZipCodes] = useState(row.approved_zip_codes ?? "");
  const [deniedZipCodes, setDeniedZipCodes] = useState(row.denied_zip_codes ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    setFormStatus(row.status);
    setAttConfirmationNumber(row.att_confirmation_number ?? "");
    setInternalNotes(row.internal_notes ?? "");
    setNotesForIcl(row.notes_for_icl ?? "");
    setApprovedZipCodes(row.approved_zip_codes ?? "");
    setDeniedZipCodes(row.denied_zip_codes ?? "");
  }, [
    row.id,
    row.status,
    row.att_confirmation_number,
    row.internal_notes,
    row.notes_for_icl,
    row.approved_zip_codes,
    row.denied_zip_codes,
  ]);

  function handleSave() {
    setSaveError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateLeadRequestAction({
        requestId: row.id,
        status: formStatus,
        attConfirmationNumber,
        attResponseNotes: "",
        internalNotes,
        notesForIcl,
        approvedZipCodes,
        deniedZipCodes,
      });
      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setSaveError(result.message ?? "Something went wrong.");
      }
    });
  }

  async function handleDeleteConfirm() {
    setDeleteError(null);
    setDeletePending(true);
    try {
      const result = await deleteLeadRequestAction(row.id);
      if (!result.ok) {
        setDeleteError(result.message ?? "Could not delete this request.");
        return;
      }
      toast.success("Request deleted.");
      router.push(isTerritoryTeam ? "/dashboard" : "/my-requests");
    } catch {
      setDeleteError("Unexpected error while deleting.");
    } finally {
      setDeletePending(false);
    }
  }

  const formData = row.form_data as Record<string, unknown> | null;

  const ownerDisplay = ownerProfile?.full_name ?? ownerProfile?.email ?? "—";
  const ownerCopyText = ownerProfile?.full_name ?? ownerProfile?.email ?? "";
  const dealerCopyText = row.dealer_code ?? "";
  const dmaCopyText = row.dma ?? "";
  const officeCopyText = row.office ?? "";
  const dateNeededDisplay = row.date_needed_by
    ? new Date(row.date_needed_by).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const dateNeededCopyText = row.date_needed_by ? dateNeededDisplay : "";
  const submittedCopyText = row.created_at ? formatDateTime(row.created_at) : "";
  const reservesCopyText = row.is_reserve ? "Yes" : "No";
  const zipCodesCopyText = formData?.zip_codes != null && String(formData.zip_codes).trim() !== ""
    ? String(formData.zip_codes)
    : "";
  const approvedZipCodesCopyText = row.approved_zip_codes?.trim() ?? "";
  const deniedZipCodesCopyText = row.denied_zip_codes?.trim() ?? "";
  const submitterNotesCopyText = row.notes?.trim() ?? "";

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={isTerritoryTeam ? "/dashboard" : "/my-requests"}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-transparent px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {formatLeadTypeLabel(row.lead_type)}
              <span className="ml-2 font-mono text-sm font-normal text-[var(--muted)]">
                #{row.id.slice(0, 8)}
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-[var(--secondary)]">
              {ownerProfile?.full_name ?? ownerProfile?.email ?? "Unknown Owner"}
              {row.dealer_code ? (
                <span className="ml-2 font-mono text-xs text-[var(--muted)]">{row.dealer_code}</span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <StatusBadge status={status} />
          <SlaChip slaStatus={sla?.status ?? null} hoursRemaining={sla?.hours ?? null} />
          <ThemeToggle />
          <Link
            href="/submit"
            className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
          >
            New Request
          </Link>
          {isTerritoryTeam || isOwnerViewer ? (
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setIsDeleteConfirmOpen(true);
              }}
              className="inline-flex h-9 items-center rounded-[6px] border border-[#ef44444d] px-3 text-sm text-[var(--status-red)] transition-colors hover:border-[var(--status-red)] hover:bg-[#ef444414]"
            >
              Delete
            </button>
          ) : null}
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Request details */}
          <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-[18px] py-3.5">
              <p className="text-[13px] font-semibold text-[var(--foreground)]">Request Details</p>
              <span className="ml-auto inline-flex items-center rounded-[20px] bg-[var(--bg4)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                {formatLeadTypeLabel(row.lead_type)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-[14px] px-[18px] py-[18px] sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Owner</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-[13px] text-[var(--foreground)]">{ownerDisplay}</p>
                  <CopyValueButton text={ownerCopyText} ariaLabel="owner" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Dealer Code</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 font-mono text-sm text-[var(--foreground)]">{row.dealer_code ?? "—"}</p>
                  <CopyValueButton text={dealerCopyText} ariaLabel="dealer code" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Lead Area</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{row.lead_area_requested}</p>
                  <CopyValueButton text={row.lead_area_requested} ariaLabel="lead area" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">DMA</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{row.dma ?? "—"}</p>
                  <CopyValueButton text={dmaCopyText} ariaLabel="DMA" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Office</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{row.office ?? "—"}</p>
                  <CopyValueButton text={officeCopyText} ariaLabel="office" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Date Needed By</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{dateNeededDisplay}</p>
                  <CopyValueButton text={dateNeededCopyText} ariaLabel="date needed by" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Submitted</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{formatDateTime(row.created_at)}</p>
                  <CopyValueButton text={submittedCopyText} ariaLabel="submitted date" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Company Reserves</p>
                <div className="mt-1 flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{row.is_reserve ? "Yes" : "No"}</p>
                  <CopyValueButton text={reservesCopyText} ariaLabel="company reserves" />
                </div>
              </div>
              {row.headcount != null ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Headcount</p>
                  <div className="mt-1 flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-sm text-[var(--foreground)]">{row.headcount}</p>
                    <CopyValueButton text={String(row.headcount)} ariaLabel="headcount" />
                  </div>
                </div>
              ) : null}
              {row.att_confirmation_number ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">AT&T Conf. #</p>
                  <div className="mt-1 flex items-start gap-2">
                    <p className="min-w-0 flex-1 font-mono text-sm text-[var(--foreground)]">{row.att_confirmation_number}</p>
                    <CopyValueButton text={row.att_confirmation_number} ariaLabel="AT&T confirmation number" />
                  </div>
                </div>
              ) : null}
              {formData?.zip_codes ? (
                <div className="col-span-2 sm:col-span-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Zip Codes</p>
                    <CopyValueButton text={zipCodesCopyText} ariaLabel="zip codes" />
                  </div>
                  <p className="mt-1 font-mono text-sm text-[var(--foreground)]">{String(formData.zip_codes)}</p>
                </div>
              ) : null}
              {row.approved_zip_codes?.trim() ? (
                <div className="col-span-2 sm:col-span-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Approved Zip Codes</p>
                    <CopyValueButton text={approvedZipCodesCopyText} ariaLabel="approved zip codes" />
                  </div>
                  <p className="mt-1 font-mono text-sm text-[var(--foreground)]">{row.approved_zip_codes}</p>
                </div>
              ) : null}
              {row.denied_zip_codes?.trim() ? (
                <div className="col-span-2 sm:col-span-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Denied Zip Codes</p>
                    <CopyValueButton text={deniedZipCodesCopyText} ariaLabel="denied zip codes" />
                  </div>
                  <p className="mt-1 font-mono text-sm text-[var(--foreground)]">{row.denied_zip_codes}</p>
                </div>
              ) : null}
              {row.notes ? (
                <div className="col-span-2 sm:col-span-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">Submitter Notes</p>
                    <CopyValueButton text={submitterNotesCopyText} ariaLabel="submitter notes" />
                  </div>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{row.notes}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Update form — territory team only */}
          {isTerritoryTeam ? (
            <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
              <div className="border-b border-[var(--border)] px-[18px] py-3.5">
                <p className="text-[13px] font-semibold text-[var(--foreground)]">Update Request</p>
              </div>
              <div className="flex flex-col gap-4 px-[18px] py-[18px]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--secondary)]">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="h-10 rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--border-hover)]"
                    >
                      {LEAD_REQUEST_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[var(--secondary)]">AT&T Confirmation #</label>
                      <CopyValueButton text={attConfirmationNumber} ariaLabel="AT&T confirmation number" />
                    </div>
                    <input
                      type="text"
                      value={attConfirmationNumber}
                      onChange={(e) => setAttConfirmationNumber(e.target.value)}
                      placeholder="Paste from AT&T email…"
                      className="h-10 rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 font-mono text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[var(--secondary)]">Approved Zip Codes</label>
                      <CopyValueButton text={approvedZipCodes} ariaLabel="approved zip codes" />
                    </div>
                    <textarea
                      value={approvedZipCodes}
                      onChange={(e) => setApprovedZipCodes(e.target.value)}
                      placeholder="Space or comma-separated zip codes approved by AT&T…"
                      rows={3}
                      className="resize-y rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 font-mono text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[var(--secondary)]">Denied Zip Codes</label>
                      <CopyValueButton text={deniedZipCodes} ariaLabel="denied zip codes" alwaysVisible />
                    </div>
                    <textarea
                      value={deniedZipCodes}
                      onChange={(e) => setDeniedZipCodes(e.target.value)}
                      placeholder="Space or comma-separated zip codes denied by AT&T…"
                      rows={3}
                      className="resize-y rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 font-mono text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[var(--secondary)]">Internal Notes</label>
                      <CopyValueButton text={internalNotes} ariaLabel="internal notes" />
                    </div>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Territory team notes (not visible to owner)…"
                      rows={3}
                      className="resize-y rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[var(--secondary)]">Notes for ICL</label>
                      <CopyValueButton text={notesForIcl} ariaLabel="notes for ICL" />
                    </div>
                    <textarea
                      value={notesForIcl}
                      onChange={(e) => setNotesForIcl(e.target.value)}
                      placeholder="Message visible to the owner…"
                      rows={3}
                      className="resize-y rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
                    />
                  </div>
                </div>

                {saveError ? (
                  <p className="rounded-[6px] border border-[#ef44444d] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--status-red)]">
                    {saveError}
                  </p>
                ) : null}

                {saved ? (
                  <p className="rounded-[6px] border border-[#22c55e4d] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--status-green)]">
                    Changes saved successfully.
                  </p>
                ) : null}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormStatus(row.status);
                      setAttConfirmationNumber(row.att_confirmation_number ?? "");
                      setInternalNotes(row.internal_notes ?? "");
                      setNotesForIcl(row.notes_for_icl ?? "");
                      setApprovedZipCodes(row.approved_zip_codes ?? "");
                      setDeniedZipCodes(row.denied_zip_codes ?? "");
                      setSaveError(null);
                      setSaved(false);
                    }}
                    className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-4 text-sm text-[var(--secondary)] transition-colors hover:text-[var(--foreground)]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="inline-flex h-9 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)] disabled:opacity-50"
                  >
                    {isPending ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : isOwnerViewer ? (
            <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
              <div className="border-b border-[var(--border)] px-[18px] py-3.5">
                <p className="text-[13px] font-semibold text-[var(--foreground)]">Notes for ICL</p>
                <p className="mt-0.5 text-[12px] text-[var(--secondary)]">
                  Shared with the territory team. Edit and save to send an update.
                </p>
              </div>
              <div className="flex flex-col gap-4 px-[18px] py-[18px]">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-[var(--secondary)]" htmlFor="owner-notes-for-icl">
                      Your notes
                    </label>
                    <CopyValueButton text={notesForIcl} ariaLabel="notes for ICL" alwaysVisible />
                  </div>
                  <textarea
                    id="owner-notes-for-icl"
                    value={notesForIcl}
                    onChange={(e) => setNotesForIcl(e.target.value)}
                    placeholder="Add a message for the territory team…"
                    rows={5}
                    className="resize-y rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
                  />
                </div>

                {saveError ? (
                  <p className="rounded-[6px] border border-[#ef44444d] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--status-red)]">
                    {saveError}
                  </p>
                ) : null}

                {saved ? (
                  <p className="rounded-[6px] border border-[#22c55e4d] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--status-green)]">
                    Changes saved successfully.
                  </p>
                ) : null}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotesForIcl(row.notes_for_icl ?? "");
                      setSaveError(null);
                      setSaved(false);
                    }}
                    className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-4 text-sm text-[var(--secondary)] transition-colors hover:text-[var(--foreground)]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="inline-flex h-9 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)] disabled:opacity-50"
                  >
                    {isPending ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right column — audit log */}
        <div className="self-start overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] px-[18px] py-3.5">
            <p className="text-[13px] font-semibold text-[var(--foreground)]">Activity Log</p>
          </div>
          <div className="px-[18px] py-3.5">
            {auditLog.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted)]">No activity yet.</p>
            ) : (
              auditLog.map((entry) => (
                <AuditEntry key={entry.id} entry={entry} currentUserId={currentProfile.id} />
              ))
            )}
          </div>
        </div>
      </div>

      {isDeleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 45%, transparent)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-request-title"
        >
          <div className="w-full max-w-[520px] rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
            <h2 id="delete-request-title" className="text-lg font-semibold text-[var(--foreground)]">
              Delete this request?
            </h2>
            <p className="mt-1 text-sm text-[var(--secondary)]">
              This permanently removes the request and related activity. This cannot be undone.
            </p>

            {deleteError ? (
              <p className="mt-3 rounded-[6px] border border-[#ef44444d] bg-[var(--card)] px-3 py-2 text-sm text-[var(--status-red)]">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={deletePending}
                className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={deletePending}
                className="inline-flex h-9 items-center rounded-[6px] border border-[#ef44444d] bg-[var(--status-red)] px-3 text-[13px] font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deletePending ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
