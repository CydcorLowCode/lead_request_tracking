"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  value: string;
  onChange: (nextValue: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [query, options]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 text-left text-sm text-[var(--foreground)] transition-colors hover:border-[var(--border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50",
        )}
        onClick={() => setIsOpen((open) => !open)}
        disabled={disabled}
      >
        <span className={selected ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
          {selected?.label ?? placeholder}
        </span>
        <span className="text-[var(--muted)]" aria-hidden="true">
          ▾
        </span>
      </button>
      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg">
          <input
            className="mb-2 h-9 w-full rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="max-h-52 overflow-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-[var(--secondary)]">{emptyText}</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex w-full rounded-[6px] px-3 py-2 text-left text-sm transition-colors hover:bg-white/5",
                    option.value === value
                      ? "bg-[var(--accent)]/20 text-[var(--foreground)]"
                      : "text-[var(--secondary)]",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
