"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { OwnerRequestRow } from "@/components/requests/owner-request-row";
import { StatusBadge } from "@/components/requests/status-badge";
import { ZipMap } from "@/components/reports/zip-map";
import { Skeleton } from "@/components/ui/skeleton";
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
import { extractZipsFromRequest } from "@/lib/reports/extract-zips";
import { TERMINAL_REQUEST_STATUSES } from "@/lib/sla/evaluate";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type OwnerHomeViewProps = {
  firstName: string;
};

type SlaConfigRow = Pick<Tables<"lrt_sla_configs">, "campaign_id" | "lead_type" | "warning_hours">;

const SEVEN_D_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MIN_MS = 60_000;

function formatRelative(updatedAt: string): string {
  const t = new Date(updatedAt).getTime();
  if (Number.isNaN(t)) {
    return formatShortDate(updatedAt);
  }
  const diffMs = Date.now() - t;
  if (diffMs < 0) {
    return formatShortDate(updatedAt);
  }
  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `${minutes}m ago`;
  }
  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
    return `${hours}h ago`;
  }
  if (diffMs < SEVEN_D_MS) {
    const days = Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
    return `${days}d ago`;
  }
  return formatShortDate(updatedAt);
}

function StatCard({
  label,
  value,
  loading,
  hint,
}: {
  label: string;
  value: number;
  loading: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-14 rounded-[6px]" />
      ) : (
        <p className="mt-1 text-[28px] font-light leading-none tracking-tight text-[var(--foreground)]">{value}</p>
      )}
      {hint && !loading ? <p className="mt-2 text-[11px] text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-3.5">
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <Skeleton className="h-4 w-24 shrink-0 rounded-[6px] lg:w-[130px]" />
        <Skeleton className="h-4 min-w-0 flex-1 rounded-[6px]" />
        <Skeleton className="h-7 w-28 shrink-0 rounded-[6px]" />
        <Skeleton className="h-4 w-14 shrink-0 rounded-[6px] lg:ml-auto" />
      </div>
    </div>
  );
}

function RecentUpdateRow({
  row,
  wasUpdatedAfterCreate,
}: {
  row: LeadRequestRow;
  wasUpdatedAfterCreate: boolean;
}) {
  const router = useRouter();
  const status = toLeadRequestStatus(row.status);

  return (
    <button
      type="button"
      onClick={() => router.push(`/requests/${row.id}`)}
      className="relative flex w-full flex-wrap items-center gap-3 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-3.5 text-left transition-colors hover:border-[var(--border-hover)] lg:flex-nowrap lg:gap-3.5"
    >
      <span className="w-full shrink-0 font-mono text-[11px] text-[var(--accent)] lg:w-[130px]">
        {formatLeadType(row.lead_type)}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--foreground)]">
        {formatLeadArea(row.lead_area_requested)}
      </span>
      <span className="flex shrink-0 flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {wasUpdatedAfterCreate ? (
          <span className="rounded-full bg-[var(--accent-glow)] px-[7px] py-0.5 text-[10px] font-medium text-[var(--accent)]">
            Updated
          </span>
        ) : null}
      </span>
      <span className="shrink-0 font-mono text-[11px] text-[var(--muted)] lg:ml-auto lg:text-right">
        {formatRelative(row.updated_at)}
      </span>
    </button>
  );
}

export function OwnerHomeView({ firstName }: OwnerHomeViewProps) {
  const [rows, setRows] = useState<LeadRequestRow[]>([]);
  const [slaConfigs, setSlaConfigs] = useState<SlaConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      setError(null);

      const [{ data: requestData, error: requestError }, { data: configData, error: configError }] =
        await Promise.all([
          supabase.from("lrt_lead_requests").select("*"),
          supabase
            .from("lrt_sla_configs")
            .select("campaign_id, lead_type, warning_hours"),
        ]);

      if (!isActive) {
        return;
      }

      if (requestError || configError) {
        setRows([]);
        setSlaConfigs([]);
        setError(requestError?.message ?? configError?.message ?? "Unable to load requests.");
      } else {
        setRows(requestData ?? []);
        setSlaConfigs(configData ?? []);
      }

      setLoading(false);
    }

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  const warningLookup = useMemo(() => buildSlaWarningLookup(slaConfigs), [slaConfigs]);

  const {
    activeCount,
    inReviewCount,
    completedThisMonthCount,
    recentUpdates,
    activeRows,
    rowsWithZips,
  } = useMemo(() => {
    const now = new Date();
    const cutoff = now.getTime() - SEVEN_D_MS;
    let active = 0;
    let inReview = 0;
    let completedThisMonth = 0;
    const y = now.getFullYear();
    const m = now.getMonth();

    for (const row of rows) {
      const status = toLeadRequestStatus(row.status);
      if (!TERMINAL_REQUEST_STATUSES.has(status)) {
        active += 1;
      }
      if (status === "submitted_to_client") {
        inReview += 1;
      }
      if (TERMINAL_REQUEST_STATUSES.has(status)) {
        const u = new Date(row.updated_at);
        if (!Number.isNaN(u.getTime()) && u.getFullYear() === y && u.getMonth() === m) {
          completedThisMonth += 1;
        }
      }
    }

    const recent = [...rows]
      .filter((row) => {
        const t = new Date(row.updated_at).getTime();
        return !Number.isNaN(t) && t >= cutoff;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map((row) => ({
        row,
        wasUpdatedAfterCreate:
          new Date(row.updated_at).getTime() - new Date(row.created_at).getTime() > ONE_MIN_MS,
      }));

    const nonTerminal = rows.filter((row) => !TERMINAL_REQUEST_STATUSES.has(toLeadRequestStatus(row.status)));
    const activeTop = sortRequestsBySlaThenCreated(nonTerminal, warningLookup).slice(0, 5);

    const rowsWithZips = rows.filter((row) => extractZipsFromRequest(row).length > 0);

    return {
      activeCount: active,
      inReviewCount: inReview,
      completedThisMonthCount: completedThisMonth,
      recentUpdates: recent,
      activeRows: activeTop,
      rowsWithZips,
    };
  }, [rows, warningLookup]);

  return (
    <main className="flex w-full flex-col gap-6 px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--foreground)]">
            Welcome, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[var(--secondary)]">Recent activity on your lead requests.</p>
        </div>
        <Link
          href="/submit"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
        >
          New Request
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Active" value={activeCount} loading={loading} />
        <StatCard label="In Review" value={inReviewCount} loading={loading} hint="Awaiting AT&T" />
        <StatCard label="Completed this month" value={completedThisMonthCount} loading={loading} />
      </div>

      {!loading && rowsWithZips.length > 0 ? (
        <section>
          <ZipMap requests={rowsWithZips} height={360} />
        </section>
      ) : null}

      {!loading && error ? (
        <div className="rounded-[10px] border border-[#ef44444d] bg-[var(--card)] px-5 py-4 text-sm text-[var(--status-red)]">
          {error}
        </div>
      ) : null}

      <section className="rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
        <header className="flex items-center justify-between border-b border-[var(--border)] px-[18px] py-3.5">
          <h2 className="text-[13px] font-semibold text-[var(--foreground)]">Recent Updates</h2>
          <span className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Last 7 days</span>
        </header>
        <div className="p-3">
          {loading ? (
            <div className="space-y-2">
              <ListRowSkeleton />
              <ListRowSkeleton />
            </div>
          ) : null}
          {!loading && error ? (
            <p className="py-8 text-center text-sm text-[var(--secondary)]">Could not load requests.</p>
          ) : null}
          {!loading && !error && recentUpdates.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center">
              <p className="text-3xl" aria-hidden>
                📭
              </p>
              <p className="mt-3 text-base font-medium text-[var(--foreground)]">No recent activity</p>
              <p className="mt-1 text-sm text-[var(--secondary)]">
                Updates to your requests will show up here.
              </p>
            </div>
          ) : null}
          {!loading && !error && recentUpdates.length > 0 ? (
            <div className="space-y-2">
              {recentUpdates.map(({ row, wasUpdatedAfterCreate }) => (
                <RecentUpdateRow
                  key={row.id}
                  row={row}
                  wasUpdatedAfterCreate={wasUpdatedAfterCreate}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
        <header className="flex items-center justify-between border-b border-[var(--border)] px-[18px] py-3.5">
          <h2 className="text-[13px] font-semibold text-[var(--foreground)]">Active Requests</h2>
          <Link
            href="/my-requests"
            className="text-[12px] font-medium text-[var(--accent)] hover:underline"
          >
            View all →
          </Link>
        </header>
        <div className="p-3">
          {loading ? (
            <div className="space-y-2">
              <ListRowSkeleton />
              <ListRowSkeleton />
            </div>
          ) : null}
          {!loading && error ? (
            <p className="py-8 text-center text-sm text-[var(--secondary)]">Could not load requests.</p>
          ) : null}
          {!loading && !error && activeRows.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-base font-medium text-[var(--foreground)]">No active requests</p>
              <p className="mt-1 text-sm text-[var(--secondary)]">Submit a new request to get started.</p>
              <Link
                href="/submit"
                className="mt-4 text-[13px] font-medium text-[var(--accent)] hover:underline"
              >
                New Request
              </Link>
            </div>
          ) : null}
          {!loading && !error && activeRows.length > 0 ? (
            <div className="space-y-2">
              {activeRows.map((row) => (
                <OwnerRequestRow
                  key={row.id}
                  row={row}
                  warningHours={getWarningHoursForRequest(row, warningLookup)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
