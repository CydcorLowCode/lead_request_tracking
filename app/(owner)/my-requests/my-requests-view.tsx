"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { OwnerRequestRow } from "@/components/requests/owner-request-row";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildSlaWarningLookup,
  getWarningHoursForRequest,
  sortRequestsBySlaThenCreated,
  toLeadRequestStatus,
  type LeadRequestRow,
} from "@/lib/lead-requests/presentation";
import { TERMINAL_REQUEST_STATUSES } from "@/lib/sla/evaluate";
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
    <main className="flex w-full flex-col gap-6 px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[20px] font-semibold tracking-tight text-[var(--foreground)]">My Requests</h1>
        <Link
          href="/submit"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
        >
          New Request
        </Link>
      </div>

      <div className="mb-5 flex gap-0 border-b border-[var(--border)]">
        {TAB_CONFIG.map((tab) => {
          const count = groupedCounts[tab.key];
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative -mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] transition-colors ${
                isActive
                  ? "border-[var(--accent)] font-medium text-[var(--accent)]"
                  : "border-transparent font-normal text-[var(--muted)] hover:text-[var(--secondary)]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.key === "active" ? (
                <span className="rounded-[10px] bg-[var(--bg4)] px-1.5 py-px text-[10px] font-semibold text-[var(--muted)]">
                  {count}
                </span>
              ) : null}
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
            className="mt-5 inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
          >
            New Request
          </Link>
        </div>
      ) : null}

      {!loading && !error && filteredRows.length > 0 ? (
        <div className="space-y-2">
          {filteredRows.map((row) => (
            <OwnerRequestRow
              key={row.id}
              row={row}
              warningHours={getWarningHoursForRequest(row, warningLookup)}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
