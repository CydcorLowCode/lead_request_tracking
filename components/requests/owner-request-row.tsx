"use client";

import { useRouter } from "next/navigation";

import { SlaChip } from "@/components/requests/sla-chip";
import { StatusBadge } from "@/components/requests/status-badge";
import {
  formatLeadType,
  formatShortDate,
  toLeadRequestStatus,
  type LeadRequestRow,
} from "@/lib/lead-requests/presentation";
import { evaluateSlaStatus } from "@/lib/sla/evaluate";

type Props = {
  row: LeadRequestRow;
  warningHours: number | null;
};

export function OwnerRequestRow({ row, warningHours }: Props) {
  const router = useRouter();
  const status = toLeadRequestStatus(row.status);
  const sla = evaluateSlaStatus({
    status,
    slaDueAt: row.sla_due_at,
    warningHours,
  });
  const overdue = sla?.status === "overdue";

  return (
    <button
      type="button"
      onClick={() => router.push(`/requests/${row.id}`)}
      className={`relative flex w-full flex-wrap items-center gap-3 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-3.5 text-left transition-colors hover:border-[var(--border-hover)] lg:flex-nowrap lg:gap-3.5 ${
        overdue ? "border-l-[3px] border-l-[var(--status-red)] pl-[15px]" : ""
      }`}
    >
      <span className="w-full shrink-0 font-mono text-[11px] text-[var(--accent)] lg:w-[130px]">
        {formatLeadType(row.lead_type)}
      </span>
      <span className="min-w-0 flex-1 text-[13px] text-[var(--foreground)]">
        {row.lead_area_requested}
      </span>
      <span className="shrink-0">
        <StatusBadge status={status} />
      </span>
      <span className="shrink-0">
        <SlaChip slaStatus={sla?.status ?? null} hoursRemaining={sla?.hours ?? null} compact />
      </span>
      <span className="shrink-0 font-mono text-[11px] text-[var(--muted)] lg:ml-auto lg:w-[88px] lg:text-right">
        {formatShortDate(row.created_at)}
      </span>
    </button>
  );
}
