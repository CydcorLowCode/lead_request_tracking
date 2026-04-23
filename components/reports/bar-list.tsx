type Entry = {
  key: string;
  count: number;
  /** Optional 0–100 number used for both bar width and color tint. */
  tintPct?: number | null;
};

type Props = {
  title: string;
  entries: Entry[];
  labelFormatter?: (key: string) => string;
  /** How bar width is computed. "tint" uses tintPct; "count" scales by max count. */
  widthMode?: "tint" | "count";
  limit?: number;
  emptyMessage?: string;
};

export function BarList({
  title,
  entries,
  labelFormatter = (k) => k,
  widthMode = "count",
  limit = 8,
  emptyMessage = "No data in this range.",
}: Props) {
  const visible = entries.slice(0, limit);
  const maxCount = Math.max(1, ...visible.map((e) => e.count));

  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-[18px] py-[14px]">
        <h3 className="text-[15px] font-semibold text-[var(--foreground)]">{title}</h3>
        <span className="text-[11px] text-[var(--muted)]">{entries.length} total</span>
      </div>
      <div className="flex flex-col gap-3 px-[18px] py-4">
        {visible.length === 0 ? (
          <p className="text-[12px] text-[var(--muted)]">{emptyMessage}</p>
        ) : (
          visible.map((entry) => {
            const widthPct =
              widthMode === "tint"
                ? (entry.tintPct ?? 0)
                : Math.round((entry.count / maxCount) * 100);
            const barColor = colorForTint(
              widthMode === "tint" ? (entry.tintPct ?? null) : null,
            );
            return (
              <div key={entry.key} className="flex items-center gap-3">
                <span className="w-[140px] shrink-0 truncate text-[13px] text-[var(--secondary)]">
                  {labelFormatter(entry.key)}
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[var(--input)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[3px]"
                    style={{ width: `${widthPct}%`, backgroundColor: barColor }}
                  />
                </div>
                {widthMode === "tint" && entry.tintPct !== null && entry.tintPct !== undefined ? (
                  <span className="w-10 shrink-0 text-right font-mono text-[12px] text-[var(--muted)]">
                    {entry.tintPct}%
                  </span>
                ) : (
                  <span className="w-10 shrink-0 text-right font-mono text-[12px] text-[var(--muted)]">
                    {entry.count}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function colorForTint(tint: number | null): string {
  if (tint === null) return "var(--accent)";
  if (tint >= 80) return "var(--status-green)";
  if (tint >= 65) return "var(--accent)";
  if (tint >= 50) return "var(--status-amber)";
  return "var(--status-red)";
}
