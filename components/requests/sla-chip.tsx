type SlaChipProps = {
  slaStatus: "on_track" | "at_risk" | "overdue" | "completed" | null;
  hoursRemaining?: number | null;
  /** Shorter copy for list views (e.g. “⚠ Overdue”) */
  compact?: boolean;
};

/** Renders hours, or days (with one decimal when needed) when above 24h. */
function formatSlaHoursAsDuration(hours: number): string {
  if (hours <= 24) {
    return `${hours}h`;
  }
  const days = hours / 24;
  const roundedTenth = Math.round(days * 10) / 10;
  const isWholeNumber = Number.isInteger(roundedTenth);
  return `${isWholeNumber ? roundedTenth : roundedTenth.toFixed(1)}d`;
}

export function SlaChip({ slaStatus, hoursRemaining = null, compact = false }: SlaChipProps) {
  if (!slaStatus) {
    return null;
  }

  if (slaStatus === "completed") {
    return <span className="lrt-sla-chip lrt-sla-done">Completed</span>;
  }

  if (slaStatus === "on_track") {
    return <span className="lrt-sla-chip lrt-sla-ok">✓ On Track</span>;
  }

  if (slaStatus === "at_risk") {
    const h = hoursRemaining ?? 0;
    return (
      <span className="lrt-sla-chip lrt-sla-warn">
        ⏱ {formatSlaHoursAsDuration(h)} left
      </span>
    );
  }

  if (compact) {
    return <span className="lrt-sla-chip lrt-sla-over">⚠ Overdue</span>;
  }

  const h = hoursRemaining ?? 0;
  return (
    <span className="lrt-sla-chip lrt-sla-over">
      ⚠ {formatSlaHoursAsDuration(h)} overdue
    </span>
  );
}
