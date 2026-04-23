import type { Delta } from "@/lib/reports/analytics";

type Props = {
  label: string;
  value: string;
  valueUnit?: string;
  delta?: Delta;
  deltaLabel?: string; // e.g. "vs last period", "faster than last period"
  sub?: string; // replaces delta line when no delta, e.g. "Excludes reserves"
  deltaGoodWhenNegative?: boolean; // true for response time (less is better)
};

export function KpiCard({
  label,
  value,
  valueUnit,
  delta,
  deltaLabel = "vs last period",
  sub,
  deltaGoodWhenNegative = false,
}: Props) {
  return (
    <div className="flex flex-col rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-4">
      <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
        {label}
      </span>
      <span className="mt-2 text-[28px] font-light leading-none text-[var(--foreground)]">
        {value}
        {valueUnit ? (
          <span className="ml-0.5 text-[18px] text-[var(--secondary)]">{valueUnit}</span>
        ) : null}
      </span>
      <span className="mt-2 text-[11px] text-[var(--muted)]">
        {delta ? (
          <>
            <DeltaTag delta={delta} goodWhenNegative={deltaGoodWhenNegative} /> {deltaLabel}
          </>
        ) : (
          sub ?? ""
        )}
      </span>
    </div>
  );
}

function DeltaTag({
  delta,
  goodWhenNegative,
}: {
  delta: Delta;
  goodWhenNegative: boolean;
}) {
  if (delta.kind === "none") {
    return <span className="text-[var(--muted)]">—</span>;
  }
  const raw = delta.value;
  const isPositive = raw > 0;
  const isZero = raw === 0;
  const isGood = isZero ? false : goodWhenNegative ? !isPositive : isPositive;
  const color = isZero
    ? "text-[var(--muted)]"
    : isGood
      ? "text-[var(--status-green)]"
      : "text-[var(--status-red)]";
  const arrow = isZero ? "—" : isPositive ? "↑" : "↓";
  const abs = Math.abs(raw);
  const suffix =
    delta.kind === "pct_points"
      ? "%"
      : delta.kind === "hours"
        ? "h"
        : delta.kind === "count"
          ? "%"
          : "";
  return (
    <span className={color}>
      {arrow} {abs}
      {suffix}
    </span>
  );
}
