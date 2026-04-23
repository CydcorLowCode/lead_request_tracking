"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { BarList } from "@/components/reports/bar-list";
import { DateRangePicker, type Preset } from "@/components/reports/date-range-picker";
import { KpiCard } from "@/components/reports/kpi-card";
import { StatusBreakdown } from "@/components/reports/status-breakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { exportLeadRequests } from "@/lib/export/export-requests";
import { formatLeadType } from "@/lib/lead-requests/presentation";
import {
  comparePeriods,
  computePeriodMetrics,
  filterCreatedInRange,
  previousRange,
  rangeOfLastNDays,
  type DateRange,
  type LeadRequestForReport,
} from "@/lib/reports/analytics";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type ProfileRow = Pick<Tables<"lrt_profiles">, "id" | "full_name" | "email">;

const PRESET_DAYS: Record<Exclude<Preset, "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ReportsView() {
  const [rows, setRows] = useState<LeadRequestForReport[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toInputDate(d);
  });
  const [customTo, setCustomTo] = useState<string>(() => toInputDate(new Date()));

  const [showDma, setShowDma] = useState(false);
  const [showOwner, setShowOwner] = useState(false);

  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase.from("lrt_lead_requests").select("*");

    if (!isMountedRef.current) {
      return;
    }

    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
      setProfiles([]);
      setLoading(false);
      return;
    }

    const loaded = data ?? [];
    const ownerIds = Array.from(new Set(loaded.map((r) => r.owner_id)));

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

    setRows(loaded);
    setProfiles(loadedProfiles);
    setLoading(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const id = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => {
      window.clearTimeout(id);
      isMountedRef.current = false;
    };
  }, [loadData]);

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const currentRange: DateRange = useMemo(() => {
    if (preset === "custom") {
      return {
        from: new Date(customFrom),
        to: new Date(`${customTo}T23:59:59`),
      };
    }
    return rangeOfLastNDays(PRESET_DAYS[preset]);
  }, [preset, customFrom, customTo]);

  const { current, deltas } = useMemo(() => {
    const prevRange = previousRange(currentRange);
    const currentRows = filterCreatedInRange(rows, currentRange);
    const previousRows = filterCreatedInRange(rows, prevRange);
    const currentMetrics = computePeriodMetrics(currentRows);
    const previousMetrics = computePeriodMetrics(previousRows);
    return {
      current: currentMetrics,
      previous: previousMetrics,
      deltas: comparePeriods(currentMetrics, previousMetrics),
    };
  }, [rows, currentRange]);

  function handleExport() {
    const rowsInRange = filterCreatedInRange(rows, currentRange);
    if (rowsInRange.length === 0) {
      return;
    }
    exportLeadRequests(rowsInRange, profileMap, { format: "csv" });
  }

  const rangeLabel =
    preset === "custom"
      ? `${customFrom} → ${customTo}`
      : preset === "7d"
        ? "Last 7 days"
        : preset === "30d"
          ? "Last 30 days"
          : "Last 90 days";

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--foreground)]">
            Analytics
          </h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            AT&amp;T Residential · {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            preset={preset}
            onPresetChange={setPreset}
            from={customFrom}
            to={customTo}
            onFromChange={setCustomFrom}
            onToChange={setCustomTo}
          />
          <ThemeToggle />
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            Export CSV
          </button>
          <LogoutButton />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[110px] rounded-[10px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Requests"
            value={current.totalRequests.toLocaleString()}
            delta={deltas.totalRequestsPct}
          />
          <KpiCard
            label="Approval Rate"
            value={current.approvalRate.ratePct === null ? "—" : String(current.approvalRate.ratePct)}
            valueUnit={current.approvalRate.ratePct === null ? undefined : "%"}
            delta={deltas.approvalRatePct}
            deltaLabel="Excludes reserves · vs last period"
          />
          <KpiCard
            label="Avg Response Time"
            value={current.avgResponseHours === null ? "—" : String(current.avgResponseHours)}
            valueUnit={current.avgResponseHours === null ? undefined : "h"}
            delta={deltas.avgResponseHours}
            deltaLabel="vs last period"
            deltaGoodWhenNegative
          />
          <KpiCard
            label="SLA Compliance"
            value={current.slaCompliance.ratePct === null ? "—" : String(current.slaCompliance.ratePct)}
            valueUnit={current.slaCompliance.ratePct === null ? undefined : "%"}
            delta={deltas.slaCompliancePct}
          />
        </div>
      )}

      {error ? (
        <div className="rounded-[10px] border border-[color:rgba(239,68,68,0.35)] bg-[var(--card)] px-5 py-4 text-sm text-[var(--status-red)]">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BarList
          title="By Lead Type"
          entries={current.byLeadType.map((b) => ({
            key: b.key,
            count: b.count,
            tintPct: b.approvalPct,
          }))}
          labelFormatter={formatLeadType}
          widthMode="tint"
          emptyMessage="No requests in this range."
        />
        <StatusBreakdown entries={current.statusBreakdown} />
      </div>

      <div className="flex flex-col gap-3">
        <CollapsibleSection title="By DMA" open={showDma} onToggle={() => setShowDma((o) => !o)}>
          <BarList title="By DMA" entries={current.byDma} widthMode="count" limit={12} />
        </CollapsibleSection>

        <CollapsibleSection
          title="By Owner"
          open={showOwner}
          onToggle={() => setShowOwner((o) => !o)}
        >
          <BarList
            title="By Owner"
            entries={current.byOwner.map((o) => ({
              key: o.ownerId,
              count: o.count,
            }))}
            widthMode="count"
            labelFormatter={(id) =>
              profileMap.get(id)?.full_name ??
              profileMap.get(id)?.email ??
              "Unknown owner"
            }
            limit={12}
          />
        </CollapsibleSection>
      </div>
    </main>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-3 text-[13px] font-medium text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
      >
        <span>{title}</span>
        <span className="text-[var(--accent)]">{open ? "▾" : "▸"}</span>
      </button>
      {open ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
