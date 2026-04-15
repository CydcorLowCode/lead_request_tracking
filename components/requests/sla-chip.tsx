type SlaChipProps = {
  slaStatus: "on_track" | "at_risk" | "overdue" | "completed" | null;
  hoursRemaining?: number | null;
};

const BASE_CLASS =
  "inline-flex min-h-7 items-center rounded-[6px] border border-[var(--border)] px-3 py-1.5 font-mono text-xs leading-snug";

export function SlaChip({ slaStatus, hoursRemaining = null }: SlaChipProps) {
  if (!slaStatus) {
    return null;
  }

  if (slaStatus === "completed") {
    return (
      <span className={`${BASE_CLASS} bg-[#242834] text-[var(--secondary)]`}>
        Completed
      </span>
    );
  }

  if (slaStatus === "on_track") {
    return (
      <span className={`${BASE_CLASS} bg-[#22c55e1f] text-[var(--status-green)]`}>
        ✓ On Track
      </span>
    );
  }

  if (slaStatus === "at_risk") {
    return (
      <span className={`${BASE_CLASS} bg-[#f59e0b26] text-[var(--status-amber)]`}>
        ⏱ {hoursRemaining ?? 0}h left
      </span>
    );
  }

  return (
    <span className={`${BASE_CLASS} bg-[#ef444426] text-[var(--status-red)]`}>
      ⚠ {hoursRemaining ?? 0}h overdue
    </span>
  );
}
