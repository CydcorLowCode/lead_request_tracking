"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { bulkUpdateStatusAction } from "@/app/dashboard/actions";
import { SlaChip } from "@/components/requests/sla-chip";
import { StatusBadge } from "@/components/requests/status-badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  buildSlaWarningLookup,
  formatLeadType,
  formatShortDate,
  getWarningHoursForRequest,
  sortRequestsBySlaThenCreated,
  toLeadRequestStatus,
  type LeadRequestRow,
} from "@/lib/lead-requests/presentation";
import { evaluateSlaStatus } from "@/lib/sla/evaluate";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import type { LeadRequestStatus } from "@/types/enums";

type SlaFilter = "all" | "overdue" | "at_risk" | "on_track";
type SlaConfigRow = Pick<Tables<"lrt_sla_configs">, "campaign_id" | "lead_type" | "warning_hours">;
type ProfileRow = Pick<Tables<"lrt_profiles">, "id" | "full_name" | "email">;

const FILTER_CHIPS = ["All Status", "Lead Type", "Office", "DMA", "Date Range"];
const STATUS_OPTIONS: Array<{ value: LeadRequestStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "submitted_to_client", label: "Submitted to AT&T" },
  { value: "leads_received", label: "Leads Received by Cydcor" },
  { value: "visible_in_salesforce", label: "Visible in Salesforce" },
  { value: "declined", label: "Declined" },
  { value: "market_proposal_answered", label: "Market Proposal Answered" },
  { value: "leads_pulled_back", label: "Leads Pulled Back by Client" },
];

export function DashboardView() {
  const router = useRouter();
  const [rows, setRows] = useState<LeadRequestRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [slaConfigs, setSlaConfigs] = useState<SlaConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [slaFilter, setSlaFilter] = useState<SlaFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<LeadRequestStatus>("new");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadDashboardData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const [{ data: requestData, error: requestError }, { data: configData, error: configError }] =
      await Promise.all([
        supabase.from("lrt_lead_requests").select("*"),
        supabase
          .from("lrt_sla_configs")
          .select("campaign_id, lead_type, warning_hours"),
      ]);

    if (!isMountedRef.current) {
      return;
    }

    if (requestError || configError) {
      setRows([]);
      setProfiles([]);
      setSlaConfigs([]);
      setError(requestError?.message ?? configError?.message ?? "Unable to load dashboard data.");
      setLoading(false);
      return;
    }

    const loadedRows = requestData ?? [];
    const ownerIds = Array.from(new Set(loadedRows.map((row) => row.owner_id)));

    let loadedProfiles: ProfileRow[] = [];
    if (ownerIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("lrt_profiles")
        .select("id, full_name, email")
        .in("id", ownerIds);

      if (!isMountedRef.current) {
        return;
      }

      if (profileError) {
        setError(profileError.message);
      } else {
        loadedProfiles = profileData ?? [];
      }
    }

    setRows(loadedRows);
    setProfiles(loadedProfiles);
    setSlaConfigs(configData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void loadDashboardData();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadDashboardData]);

  const warningLookup = useMemo(() => buildSlaWarningLookup(slaConfigs), [slaConfigs]);
  const profileMap = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const sortedRows = useMemo(
    () => sortRequestsBySlaThenCreated(rows, warningLookup),
    [rows, warningLookup],
  );

  const withSla = useMemo(
    () =>
      sortedRows.map((row) => ({
        row,
        status: toLeadRequestStatus(row.status),
        sla: evaluateSlaStatus({
          status: toLeadRequestStatus(row.status),
          slaDueAt: row.sla_due_at,
          warningHours: getWarningHoursForRequest(row, warningLookup),
        }),
      })),
    [sortedRows, warningLookup],
  );

  const summary = useMemo(
    () =>
      withSla.reduce(
        (acc, item) => {
          if (item.sla?.status === "overdue") {
            acc.overdue += 1;
          } else if (item.sla?.status === "at_risk") {
            acc.atRisk += 1;
          } else if (item.sla?.status === "on_track") {
            acc.onTrack += 1;
          }
          return acc;
        },
        { overdue: 0, atRisk: 0, onTrack: 0 },
      ),
    [withSla],
  );

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return withSla.filter(({ row, sla }) => {
      if (slaFilter !== "all" && sla?.status !== slaFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [row.lead_area_requested, row.dealer_code ?? "", row.att_confirmation_number ?? ""]
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [searchTerm, slaFilter, withSla]);

  const selectedCount = selectedIds.size;
  const allSelected = filteredRows.length > 0 && selectedCount === filteredRows.length;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredRows.map((item) => item.row.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function openBulkStatusModal() {
    setBulkError(null);
    setIsBulkStatusModalOpen(true);
  }

  async function handleBulkStatusConfirm() {
    if (selectedIds.size === 0) {
      setBulkError("Select at least one request.");
      return;
    }

    setBulkSubmitting(true);
    setBulkError(null);
    try {
      const result = await bulkUpdateStatusAction({
        ids: Array.from(selectedIds),
        status: bulkStatus,
      });

      if (!result.ok) {
        setBulkError(result.message ?? "Unable to update request statuses.");
        return;
      }

      setSelectedIds(new Set());
      await loadDashboardData();
      setIsBulkStatusModalOpen(false);
    } catch {
      setBulkError("Unexpected error updating request statuses.");
    } finally {
      setBulkSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1220px] flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div> 
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--secondary)]">AT&amp;T Residential</p>
        </div>
        <div className="flex items-center gap-2">
          <LogoutButton />
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            Export
          </button>
          <Link
            href="/submit"
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:brightness-110"
          >
            New Request
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setSlaFilter((current) => (current === "overdue" ? "all" : "overdue"))}
          className={`rounded-[10px] border bg-[var(--card)] p-4 text-left transition-colors ${
            slaFilter === "overdue"
              ? "border-[#ef444480]"
              : "border-[var(--border)] hover:border-[var(--border-hover)]"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--secondary)]">Overdue</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--status-red)]">{summary.overdue}</p>
        </button>
        <button
          type="button"
          onClick={() => setSlaFilter((current) => (current === "at_risk" ? "all" : "at_risk"))}
          className={`rounded-[10px] border bg-[var(--card)] p-4 text-left transition-colors ${
            slaFilter === "at_risk"
              ? "border-[#f59e0b80]"
              : "border-[var(--border)] hover:border-[var(--border-hover)]"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--secondary)]">At Risk</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--status-amber)]">{summary.atRisk}</p>
        </button>
        <button
          type="button"
          onClick={() => setSlaFilter((current) => (current === "on_track" ? "all" : "on_track"))}
          className={`rounded-[10px] border bg-[var(--card)] p-4 text-left transition-colors ${
            slaFilter === "on_track"
              ? "border-[#22c55e80]"
              : "border-[var(--border)] hover:border-[var(--border-hover)]"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--secondary)]">On Track</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--status-green)]">{summary.onTrack}</p>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-3">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search requests..."
          className="h-10 w-full max-w-[320px] rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--border-hover)]"
        />
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className="inline-flex h-8 items-center rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 text-xs font-medium text-[var(--secondary)]"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--secondary)]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded-[4px] border border-[var(--border)] bg-[var(--input)]"
                />
              </th>
              <th className="px-4 py-3">Owner / Dealer</th>
              <th className="px-4 py-3">Lead Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className={index < 6 ? "border-b border-[var(--border)]" : undefined}
                  >
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4 rounded-[4px]" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="mb-1 h-4 w-36 rounded-[6px]" />
                      <Skeleton className="h-3 w-20 rounded-[6px]" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-7 w-28 rounded-[6px]" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-40 rounded-[6px]" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-7 w-28 rounded-[6px]" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-7 w-24 rounded-[6px]" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-14 rounded-[6px]" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4 rounded-[6px]" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && !error && filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">No requests found</p>
                  <p className="mt-1 text-sm text-[var(--secondary)]">
                    Try adjusting search or SLA filters.
                  </p>
                </td>
              </tr>
            ) : null}

            {!loading && !error
              ? filteredRows.map(({ row, status, sla }, index) => {
                  const owner = profileMap.get(row.owner_id);
                  const selected = selectedIds.has(row.id);
                  return (
                    <tr
  key={row.id}
  onClick={() => router.push(`/requests/${row.id}`)}
  className={`cursor-pointer transition-colors hover:bg-[var(--input)] ${
    index < filteredRows.length - 1 ? "border-b border-[var(--border)]" : ""
  }`}
>
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleOne(row.id)}
                          className="h-4 w-4 rounded-[4px] border border-[var(--border)] bg-[var(--input)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-[var(--foreground)]">{owner?.full_name ?? owner?.email ?? "Unknown Owner"}</p>
                        <p className="font-mono text-xs text-[var(--muted)]">{row.dealer_code ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-7 items-center rounded-[6px] bg-[var(--input)] px-2.5 font-mono text-xs text-[var(--foreground)]">
                          {formatLeadType(row.lead_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">{row.lead_area_requested}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <SlaChip
                          slaStatus={sla?.status ?? null}
                          hoursRemaining={sla?.hours ?? null}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {formatShortDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right text-lg text-[var(--muted)]">›</td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-[#ef44444d] bg-[var(--card)] px-5 py-4 text-sm text-[var(--status-red)]">
          {error}
        </div>
      ) : null}

      <div
        className={`sticky bottom-4 z-10 mt-1 flex items-center justify-between gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] transition-all ${
          selectedCount > 0 ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <p className="text-sm text-[var(--foreground)]">{selectedCount} requests selected</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openBulkStatusModal}
            className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            Update Status
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            Add Note
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            Export Selected
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            ✕ Clear
          </button>
        </div>
      </div>

      {isBulkStatusModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/75 px-4">
          <div className="w-full max-w-[520px] rounded-[10px] border border-[var(--border2)] bg-[var(--card)] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Update {selectedCount} requests</h2>
            <p className="mt-1 text-sm text-[var(--secondary)]">Choose a new status for all selected requests.</p>

            <label className="mt-4 block text-xs uppercase tracking-[0.08em] text-[var(--secondary)]">
              Status
            </label>
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value as LeadRequestStatus)}
              disabled={bulkSubmitting}
              className="mt-2 h-10 w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {bulkError ? (
              <p className="mt-3 rounded-[6px] border border-[#ef44444d] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--status-red)]">
                {bulkError}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkStatusModalOpen(false)}
                disabled={bulkSubmitting}
                className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleBulkStatusConfirm()}
                disabled={bulkSubmitting}
                className="inline-flex h-9 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {bulkSubmitting ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
