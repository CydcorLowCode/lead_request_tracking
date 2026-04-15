"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { SlaChip } from "@/components/requests/sla-chip";
import { StatusBadge } from "@/components/requests/status-badge";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  buildSlaWarningLookup,
  formatLeadType,
  getWarningHoursForRequest,
  toLeadRequestStatus,
  type LeadRequestRow,
} from "@/lib/lead-requests/presentation";
import { evaluateSlaStatus } from "@/lib/sla/evaluate";
import type { Tables } from "@/types/database";
import { LEAD_REQUEST_STATUSES } from "@/types/enums";
import { updateLeadRequestAction } from "./actions";

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
  } else if (entry.field_name) {
    description = `${entry.field_name} updated`;
  }

  return (
    <div className="flex gap-3 py-3 border-b border-[var(--border)] last:border-b-0">
      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--accent)]" />
      <div>
        <p className="text-sm text-[var(--foreground)]">{description}</p>
        <p className="mt-0.5 font-mono text-xs text-[var(--muted)]">
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

  // Form state
  const [formStatus, setFormStatus] = useState(row.status);
  const [attConfirmationNumber, setAttConfirmationNumber] = useState(row.att_confirmation_number ?? "");
  const [internalNotes, setInternalNotes] = useState(row.internal_notes ?? "");
  const [notesForIcl, setNotesForIcl] = useState(row.notes_for_icl ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      });
      if (result.ok) {
        setSaved(true);
      } else {
        setSaveError(result.message ?? "Something went wrong.");
      }
    });
  }

  const formData = row.form_data as Record<string, unknown> | null;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
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
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <SlaChip slaStatus={sla?.status ?? null} hoursRemaining={sla?.hours ?? null} />
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Request details */}
          <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3.5">
              <p className="text-sm font-semibold text-[var(--foreground)]">Request Details</p>
              <span className="ml-auto inline-flex h-6 items-center rounded-[6px] bg-[#242834] px-2.5 font-mono text-xs text-[var(--muted)]">
                {formatLeadTypeLabel(row.lead_type)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-5 py-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Owner</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">
                  {ownerProfile?.full_name ?? ownerProfile?.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Dealer Code</p>
                <p className="mt-1 font-mono text-sm text-[var(--foreground)]">{row.dealer_code ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Lead Area</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{row.lead_area_requested}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">DMA</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{row.dma ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Office</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{row.office ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Date Needed By</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">
                  {row.date_needed_by
                    ? new Date(row.date_needed_by).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Submitted</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{formatDateTime(row.created_at)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Company Reserves</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{row.is_reserve ? "Yes" : "No"}</p>
              </div>
              {row.headcount != null ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Headcount</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{row.headcount}</p>
                </div>
              ) : null}
              {row.att_confirmation_number ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">AT&T Conf. #</p>
                  <p className="mt-1 font-mono text-sm text-[var(--foreground)]">{row.att_confirmation_number}</p>
                </div>
              ) : null}
              {formData?.zip_codes ? (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Zip Codes</p>
                  <p className="mt-1 font-mono text-sm text-[var(--foreground)]">{String(formData.zip_codes)}</p>
                </div>
              ) : null}
              {row.notes ? (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Submitter Notes</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{row.notes}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Update form — territory team only */}
          {isTerritoryTeam ? (
            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-5 py-3.5">
                <p className="text-sm font-semibold text-[var(--foreground)]">Update Request</p>
              </div>
              <div className="flex flex-col gap-4 px-5 py-5">
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
                    <label className="text-xs font-medium text-[var(--secondary)]">AT&T Confirmation #</label>
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
                    <label className="text-xs font-medium text-[var(--secondary)]">Internal Notes</label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Territory team notes (not visible to owner)…"
                      rows={3}
                      className="resize-y rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--secondary)]">Notes for ICL</label>
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
                    className="inline-flex h-9 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:brightness-110 disabled:opacity-50"
                  >
                    {isPending ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Owner read-only notes */
            row.notes_for_icl ? (
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Notes from Territory Team</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{row.notes_for_icl}</p>
              </div>
            ) : null
          )}
        </div>

        {/* Right column — audit log */}
        <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] overflow-hidden self-start">
          <div className="border-b border-[var(--border)] px-5 py-3.5">
            <p className="text-sm font-semibold text-[var(--foreground)]">Activity Log</p>
          </div>
          <div className="px-5 py-2">
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
    </main>
  );
}
