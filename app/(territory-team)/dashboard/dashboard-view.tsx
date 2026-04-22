"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { bulkDeleteRequestsAction, bulkUpdateStatusAction } from "@/app/(territory-team)/dashboard/actions";
import { SlaChip } from "@/components/requests/sla-chip";
import { StatusBadge } from "@/components/requests/status-badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  buildSlaWarningLookup,
  formatLeadArea,
  formatLeadType,
  formatShortDate,
  getWarningHoursForRequest,
  sortRequestsBySlaThenCreated,
  toLeadRequestStatus,
  type LeadRequestRow,
} from "@/lib/lead-requests/presentation";
import { exportLeadRequests } from "@/lib/export/export-requests";
import { evaluateSlaStatus } from "@/lib/sla/evaluate";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import type { LeadRequestStatus } from "@/types/enums";

type SlaFilter = "all" | "overdue" | "at_risk" | "on_track";
type SlaConfigRow = Pick<Tables<"lrt_sla_configs">, "campaign_id" | "lead_type" | "warning_hours">;
type ProfileRow = Pick<Tables<"lrt_profiles">, "id" | "full_name" | "email">;

const FILTER_SELECT_CLASS =
  "inline-flex h-8 max-w-[220px] min-w-0 shrink cursor-pointer rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-[7px] text-[12px] text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] outline-none focus:border-[var(--accent)]";

const STATUS_OPTIONS: Array<{ value: LeadRequestStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "submitted_to_client", label: "Submitted to AT&T" },
  { value: "leads_received", label: "Leads Received by Cydcor" },
  { value: "visible_in_salesforce", label: "Visible in Salesforce" },
  { value: "declined", label: "Declined" },
  { value: "market_proposal_answered", label: "Market Proposal Answered" },
  { value: "leads_pulled_back", label: "Leads Pulled Back by Client" },
];

export function DashboardView({ showAttImportLink }: { showAttImportLink: boolean }) {
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("xlsx");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeadRequestStatus | "all">("all");
  const [leadTypeFilter, setLeadTypeFilter] = useState<string>("all");
  const [officeFilter, setOfficeFilter] = useState<string>("all");
  const [dmaFilter, setDmaFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const exportMenuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!exportMenuOpen) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (exportMenuRef.current?.contains(event.target as Node)) {
        return;
      }
      setExportMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [exportMenuOpen]);

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

  const leadTypeOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.lead_type))).sort(),
    [rows],
  );
  const officeOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.office).filter(Boolean))).sort() as string[],
    [rows],
  );
  const dmaOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.dma).filter(Boolean))).sort() as string[],
    [rows],
  );

  const hasActiveFilters = useMemo(
    () =>
      statusFilter !== "all" ||
      leadTypeFilter !== "all" ||
      officeFilter !== "all" ||
      dmaFilter !== "all" ||
      dateFromFilter !== "" ||
      dateToFilter !== "" ||
      searchTerm.trim() !== "" ||
      slaFilter !== "all",
    [
      statusFilter,
      leadTypeFilter,
      officeFilter,
      dmaFilter,
      dateFromFilter,
      dateToFilter,
      searchTerm,
      slaFilter,
    ],
  );

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return withSla.filter(({ row, sla }) => {
      if (slaFilter !== "all" && sla?.status !== slaFilter) {
        return false;
      }

      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }

      if (leadTypeFilter !== "all" && row.lead_type !== leadTypeFilter) {
        return false;
      }

      if (officeFilter !== "all" && row.office !== officeFilter) {
        return false;
      }

      if (dmaFilter !== "all" && row.dma !== dmaFilter) {
        return false;
      }

      if (dateFromFilter !== "" && new Date(row.created_at) < new Date(dateFromFilter)) {
        return false;
      }

      if (dateToFilter !== "" && new Date(row.created_at) > new Date(`${dateToFilter}T23:59:59`)) {
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
  }, [
    searchTerm,
    slaFilter,
    statusFilter,
    leadTypeFilter,
    officeFilter,
    dmaFilter,
    dateFromFilter,
    dateToFilter,
    withSla,
  ]);

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

  function exportFilteredRows(format: "csv" | "xlsx") {
    if (filteredRows.length === 0) {
      toast.error("No rows to export");
      return;
    }
    const data = filteredRows.map(({ row }) => row);
    exportLeadRequests(data, profileMap, { format });
  }

  function handleHeaderExportXlsx() {
    setExportMenuOpen(false);
    setExportFormat("xlsx");
    exportFilteredRows("xlsx");
  }

  function handleMenuExport(format: "csv" | "xlsx") {
    setExportFormat(format);
    setExportMenuOpen(false);
    exportFilteredRows(format);
  }

  function clearAllFilters() {
    setStatusFilter("all");
    setLeadTypeFilter("all");
    setOfficeFilter("all");
    setDmaFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setSearchTerm("");
    setSlaFilter("all");
  }

  function handleExportSelected() {
    const selectedRows = rows.filter((r) => selectedIds.has(r.id));
    if (selectedRows.length === 0) {
      toast.error("No rows to export");
      return;
    }
    exportLeadRequests(selectedRows, profileMap, { format: "xlsx" });
  }

  function openDeleteConfirm() {
    setDeleteError(null);
    setIsDeleteConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (selectedIds.size === 0) {
      setDeleteError("Select at least one request.");
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      const result = await bulkDeleteRequestsAction({ ids: Array.from(selectedIds) });

      if (!result.ok) {
        setDeleteError(result.message ?? "Unable to delete requests.");
        return;
      }

      toast.success(result.message ?? "Requests deleted.");
      setSelectedIds(new Set());
      await loadDashboardData();
      setIsDeleteConfirmOpen(false);
    } catch {
      setDeleteError("Unexpected error deleting requests.");
    } finally {
      setDeleteSubmitting(false);
    }
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
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--foreground)]">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">AT&amp;T Residential</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showAttImportLink ? (
            <Link
              href="/imports/new"
              className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
            >
              Import AT&amp;T Report
            </Link>
          ) : null}
          <div ref={exportMenuRef} className="relative">
            <div className="inline-flex h-10 overflow-hidden rounded-[6px] border border-[var(--border)] bg-transparent">
              <button
                type="button"
                onClick={handleHeaderExportXlsx}
                className="inline-flex items-center justify-center border-r border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
              >
                Export
              </button>
              <button
                type="button"
                aria-expanded={exportMenuOpen}
                aria-haspopup="menu"
                aria-label="Choose export format"
                onClick={() => setExportMenuOpen((open) => !open)}
                className="inline-flex w-9 items-center justify-center text-[var(--secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
              >
                <span className="text-xs" aria-hidden>
                  ▾
                </span>
              </button>
            </div>
            {exportMenuOpen ? (
              <div
                className="absolute right-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--card)] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleMenuExport("xlsx")}
                  className={`flex w-full px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--input)] ${
                    exportFormat === "xlsx" ? "bg-[var(--input)]/60" : ""
                  }`}
                >
                  Export as Excel
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleMenuExport("csv")}
                  className={`flex w-full px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--input)] ${
                    exportFormat === "csv" ? "bg-[var(--input)]/60" : ""
                  }`}
                >
                  Export as CSV
                </button>
              </div>
            ) : null}
          </div>
          <Link
            href="/submit"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
          >
            New Request
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setSlaFilter((current) => (current === "overdue" ? "all" : "overdue"))}
          className={`flex items-center gap-2.5 rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-[14px] py-2.5 text-left transition-colors ${
            slaFilter === "overdue" ? "ring-1 ring-[var(--status-red)]/40" : "hover:border-[var(--border-hover)]"
          }`}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--status-red)]" aria-hidden />
          <span className="flex-1 text-[12px] text-[var(--secondary)]">Overdue</span>
          <span className="text-[18px] font-medium text-[var(--status-red)]">{summary.overdue}</span>
        </button>
        <button
          type="button"
          onClick={() => setSlaFilter((current) => (current === "at_risk" ? "all" : "at_risk"))}
          className={`flex items-center gap-2.5 rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-[14px] py-2.5 text-left transition-colors ${
            slaFilter === "at_risk" ? "ring-1 ring-[var(--status-amber)]/40" : "hover:border-[var(--border-hover)]"
          }`}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--status-amber)]" aria-hidden />
          <span className="flex-1 text-[12px] text-[var(--secondary)]">At Risk</span>
          <span className="text-[18px] font-medium text-[var(--status-amber)]">{summary.atRisk}</span>
        </button>
        <button
          type="button"
          onClick={() => setSlaFilter((current) => (current === "on_track" ? "all" : "on_track"))}
          className={`flex items-center gap-2.5 rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-[14px] py-2.5 text-left transition-colors ${
            slaFilter === "on_track" ? "ring-1 ring-[var(--status-green)]/40" : "hover:border-[var(--border-hover)]"
          }`}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--status-green)]" aria-hidden />
          <span className="flex-1 text-[12px] text-[var(--secondary)]">On Track</span>
          <span className="text-[18px] font-medium text-[var(--status-green)]">{summary.onTrack}</span>
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex min-h-10 flex-1 max-w-[320px] items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-[7px]">
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="shrink-0 text-[var(--muted)]"
            aria-hidden
          >
            <circle cx="6.5" cy="6.5" r="4" />
            <path d="M11 11l3 3" />
          </svg>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search dealer code, location, confirmation ID…"
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value === "all" ? "all" : (event.target.value as LeadRequestStatus),
            )
          }
          aria-label="Filter by status"
          className={FILTER_SELECT_CLASS}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={leadTypeFilter}
          onChange={(event) => setLeadTypeFilter(event.target.value)}
          aria-label="Filter by lead type"
          className={FILTER_SELECT_CLASS}
        >
          <option value="all">All Lead Types</option>
          {leadTypeOptions.map((value) => (
            <option key={value} value={value}>
              {formatLeadType(value)}
            </option>
          ))}
        </select>
        <select
          value={officeFilter}
          onChange={(event) => setOfficeFilter(event.target.value)}
          aria-label="Filter by office"
          className={FILTER_SELECT_CLASS}
        >
          <option value="all">All Offices</option>
          {officeOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={dmaFilter}
          onChange={(event) => setDmaFilter(event.target.value)}
          aria-label="Filter by DMA"
          className={FILTER_SELECT_CLASS}
        >
          <option value="all">All DMAs</option>
          {dmaOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFromFilter}
          onChange={(event) => setDateFromFilter(event.target.value)}
          aria-label="Submitted from date"
          className={`${FILTER_SELECT_CLASS} max-w-none font-mono text-[11px]`}
        />
        <input
          type="date"
          value={dateToFilter}
          onChange={(event) => setDateToFilter(event.target.value)}
          aria-label="Submitted to date"
          className={`${FILTER_SELECT_CLASS} max-w-none font-mono text-[11px]`}
        />
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex h-8 items-center rounded-[6px] border border-transparent px-3 text-[12px] text-[var(--secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="w-9 py-[10px] pl-[14px] pr-0 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-[14px] w-[14px] accent-[var(--accent)]"
                />
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                Owner / Dealer
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                Lead Type
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                Location / Zip
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                Status
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                SLA
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                Submitted
              </th>
              <th className="w-8 px-[14px] py-[10px]" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className={index < 6 ? "border-b border-[var(--border)]" : undefined}
                  >
                    <td className="py-[11px] pl-[14px] pr-0">
                      <Skeleton className="h-[14px] w-[14px] rounded-[2px]" />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <Skeleton className="mb-1 h-4 w-36 rounded-[4px]" />
                      <Skeleton className="h-3 w-20 rounded-[4px]" />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <Skeleton className="h-5 w-28 rounded-[4px]" />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <Skeleton className="h-4 w-40 rounded-[4px]" />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <Skeleton className="h-5 w-28 rounded-[999px]" />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <Skeleton className="h-5 w-24 rounded-[999px]" />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <Skeleton className="h-3 w-14 rounded-[4px]" />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <Skeleton className="h-3.5 w-3.5 rounded-[2px]" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && !error && filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <p className="text-[15px] font-medium text-[var(--secondary)]">No requests found</p>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">
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
                      <td className="py-[11px] pl-[14px] pr-0" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleOne(row.id)}
                          className="h-[14px] w-[14px] accent-[var(--accent)]"
                        />
                      </td>
                      <td className="px-[14px] py-[11px]">
                        <p className="text-[13px] font-medium text-[var(--foreground)]">
                          {owner?.full_name ?? owner?.email ?? "Unknown Owner"}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--muted)]">{row.dealer_code ?? "—"}</p>
                      </td>
                      <td className="whitespace-nowrap px-[14px] py-[11px]">
                        <span className="lrt-lead-type">{formatLeadType(row.lead_type)}</span>
                      </td>
                      <td className="max-w-[320px] break-words px-[14px] py-[11px] text-[13px] text-[var(--secondary)]">
                        {formatLeadArea(row.lead_area_requested)}
                      </td>
                      <td className="px-[14px] py-[11px]">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-[14px] py-[11px]">
                        <SlaChip
                          slaStatus={sla?.status ?? null}
                          hoursRemaining={sla?.hours ?? null}
                        />
                      </td>
                      <td className="whitespace-nowrap px-[14px] py-[11px] font-mono text-[11px] text-[var(--muted)]">
                        {formatShortDate(row.created_at)}
                      </td>
                      <td className="px-[14px] py-[11px] text-[var(--muted)]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden
                        >
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </td>
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
        className={`sticky bottom-4 z-10 mt-3 flex items-center gap-2.5 rounded-[10px] border border-[var(--border-hover)] bg-[var(--input)] px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] transition-all ${
          selectedCount > 0 ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <p className="flex-1 text-[13px] font-medium text-[var(--foreground)]">
          <span className="text-[var(--accent)]">{selectedCount}</span> requests selected
        </p>
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
            onClick={handleExportSelected}
            className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
          >
            Export Selected
          </button>
          <button
            type="button"
            onClick={openDeleteConfirm}
            className="inline-flex h-9 items-center rounded-[6px] border border-[#ef44444d] px-3 text-sm text-[var(--status-red)] transition-colors hover:border-[var(--status-red)] hover:bg-[#ef444414]"
          >
            Delete
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

      {isDeleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 45%, transparent)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-selected-title"
        >
          <div className="w-full max-w-[520px] rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
            <h2 id="delete-selected-title" className="text-lg font-semibold text-[var(--foreground)]">
              Delete {selectedCount} request{selectedCount === 1 ? "" : "s"}?
            </h2>
            <p className="mt-1 text-sm text-[var(--secondary)]">
              This permanently removes the selected requests and related records. This action cannot be undone.
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
                disabled={deleteSubmitting}
                className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] px-3 text-sm text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={deleteSubmitting}
                className="inline-flex h-9 items-center rounded-[6px] border border-[#ef44444d] bg-[var(--status-red)] px-3 text-[13px] font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteSubmitting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isBulkStatusModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 45%, transparent)" }}
        >
          <div className="w-full max-w-[520px] rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Update {selectedCount} requests</h2>
            <p className="mt-1 text-sm text-[var(--secondary)]">Choose a new status for all selected requests.</p>

            <label className="mt-4 block text-xs uppercase tracking-[0.08em] text-[var(--secondary)]">
              Status
            </label>
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value as LeadRequestStatus)}
              disabled={bulkSubmitting}
              className="mt-2 h-10 w-full rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {bulkError ? (
              <p className="mt-3 rounded-[6px] border border-[#ef44444d] bg-[var(--card)] px-3 py-2 text-sm text-[var(--status-red)]">
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
                className="inline-flex h-9 items-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)] disabled:cursor-not-allowed disabled:opacity-70"
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
