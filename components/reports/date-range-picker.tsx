"use client";

type Preset = "7d" | "30d" | "90d" | "custom";

type Props = {
  preset: Preset;
  onPresetChange: (p: Preset) => void;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
};

const PRESET_OPTIONS: Array<{ value: Preset; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

export function DateRangePicker({
  preset,
  onPresetChange,
  from,
  to,
  onFromChange,
  onToChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={preset}
        onChange={(e) => onPresetChange(e.target.value as Preset)}
        aria-label="Date range preset"
        className="inline-flex h-9 cursor-pointer rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 text-[13px] text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
      >
        {PRESET_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {preset === "custom" ? (
        <>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            aria-label="From date"
            className="inline-flex h-9 rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 font-mono text-[11px] text-[var(--secondary)] outline-none focus:border-[var(--accent)]"
          />
          <span className="text-[12px] text-[var(--muted)]">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            aria-label="To date"
            className="inline-flex h-9 rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 font-mono text-[11px] text-[var(--secondary)] outline-none focus:border-[var(--accent)]"
          />
        </>
      ) : null}
    </div>
  );
}

export type { Preset };
