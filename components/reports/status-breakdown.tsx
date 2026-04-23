import { StatusBadge } from "@/components/requests/status-badge";
import type { LeadRequestStatus } from "@/types/enums";

type Props = {
  entries: Array<{ status: LeadRequestStatus; count: number }>;
};

export function StatusBreakdown({ entries }: Props) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-[18px] py-[14px]">
        <h3 className="text-[15px] font-semibold text-[var(--foreground)]">Status Breakdown</h3>
      </div>
      <div className="flex flex-col px-[18px]">
        {entries.length === 0 ? (
          <p className="py-4 text-[12px] text-[var(--muted)]">No data in this range.</p>
        ) : (
          entries.map((e, i) => (
            <div
              key={e.status}
              className={`flex items-center justify-between py-3 ${
                i < entries.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <StatusBadge status={e.status} />
              <span className="font-mono text-[14px] text-[var(--foreground)]">{e.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
