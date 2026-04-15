"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
import { evaluateSlaStatus, TERMINAL_REQUEST_STATUSES } from "@/lib/sla/evaluate";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type TabKey = "active" | "completed" | "all";

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

type SlaConfigRow = Pick<Tables<"lrt_sla_configs">, "campaign_id" | "lead_type" | "warning_hours">;

function RequestCardSkeleton() {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[150px_1fr_auto_auto_88px] lg:items-center">
        <Skeleton className="h-5 w-28 rounded-[6px]" />
        <Skeleton className="h-5 w-full rounded-[6px]" />
        <Skeleton className="h-7 w-36 rounded-[6px]" />
        <Skeleton className="h-7 w-24 rounded-[6px]" />
        <Skeleton className="h-5 w-16 justify-self-end rounded-[6px]" />
      </div>
    </div>
  );
}

export function MyRequestsView() {
  const router = useRouter();
  const [rows, setRows] = useState<LeadRequestRow[]>([]);
  const [slaConfigs, setSlaConfigs] = useState<SlaConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("active");

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
  const sortedRows = useMemo(
    () => sortRequestsBySlaThenCreated(rows, warningLookup),
    [rows, warningLookup],
  );

  const groupedCounts = useMemo(() => {
    return sortedRows.reduce(
      (acc, row) => {
        const status = toLeadRequestStatus(row.status);
        if (TERMINAL_REQUEST_STATUSES.has(status)) {
          acc.completed += 1;
        } else {
          acc.active += 1;
        }
        acc.all += 1;
        return acc;
      },
      { active: 0, completed: 0, all: 0 },
    );
  }, [sortedRows]);

  const filteredRows = useMemo(() => {
    if (activeTab === "all") {
      return sortedRows;
    }

    return sortedRows.filter((row) => {
      const status = toLeadRequestStatus(row.status);
      const isCompleted = TERMINAL_REQUEST_STATUSES.has(status);
      return activeTab === "completed" ? isCompleted : !isCompleted;
    });
  }, [activeTab, sortedRows]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            My Requests
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/submit"
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:brightness-110"
          >
            New Request
          </Link>
          <LogoutButton />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TAB_CONFIG.map((tab) => {
          const count = groupedCounts[tab.key];
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex h-9 items-center gap-2 rounded-[6px] border px-3 text-sm transition-colors ${
                isActive
                  ? "border-[var(--border-hover)] bg-[var(--input)] text-[var(--foreground)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-[6px] bg-[var(--input)] px-2 py-0.5 font-mono text-xs text-[var(--secondary)]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          <RequestCardSkeleton />
          <RequestCardSkeleton />
          <RequestCardSkeleton />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-[10px] border border-[#ef44444d] bg-[var(--card)] px-5 py-4 text-sm text-[var(--status-red)]">
          {error}
        </div>
      ) : null}

      {!loading && !error && filteredRows.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-6 text-center">
          <p className="text-3xl" aria-hidden>
            📭
          </p>
          <p className="mt-3 text-base font-medium text-[var(--foreground)]">No requests yet</p>
          <p className="mt-1 text-sm text-[var(--secondary)]">
            Submit your first lead request to get started.
          </p>
          <Link
            href="/submit"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:brightness-110"
          >
            New Request
          </Link>
        </div>
      ) : null}

      {!loading && !error && filteredRows.length > 0 ? (
        <div className="space-y-3">
          {filteredRows.map((row) => {
            const status = toLeadRequestStatus(row.status);
            const sla = evaluateSlaStatus({
              status,
              slaDueAt: row.sla_due_at,
              warningHours: getWarningHoursForRequest(row, warningLookup),
            });

            const accentClass =
              sla?.status === "overdue"
                ? "bg-[var(--status-red)]"
                : sla?.status === "at_risk"
                  ? "bg-[var(--status-amber)]"
                  : "bg-transparent";

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => router.push(`/requests/${row.id}`)}
                className="relative block w-full overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)] text-left transition-colors hover:border-[var(--border-hover)]"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${accentClass}`} aria-hidden />
                <div className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[150px_1fr_auto_auto_88px] lg:items-center lg:gap-4">
                  <span className="font-mono text-sm text-[var(--accent)]">{formatLeadType(row.lead_type)}</span>
                  <span className="truncate text-sm text-[var(--foreground)]">{row.lead_area_requested}</span>
                  <StatusBadge status={status} />
                  <SlaChip slaStatus={sla?.status ?? null} hoursRemaining={sla?.hours ?? null} />
                  <span className="justify-self-start font-mono text-xs text-[var(--muted)] lg:justify-self-end">
                    {formatShortDate(row.created_at)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
