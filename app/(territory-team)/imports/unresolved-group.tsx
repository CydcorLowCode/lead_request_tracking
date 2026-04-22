"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { UnresolvedImportGroup } from "@/app/imports/actions";
import { ImportRowExpansion } from "@/components/imports/import-row-expansion";
import { formatRelativeTime } from "@/lib/format-relative";
import { cn } from "@/lib/utils";

export function UnresolvedGroupCard({ group }: { group: UnresolvedImportGroup }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const { import: imp, rows, profileNames } = group;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--input)]/50"
      >
        <div>
          <p className="text-[13px] font-medium text-[var(--foreground)]">
            {formatRelativeTime(imp.created_at)} · {imp.file_name ?? "—"}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {rows.length} unresolved
          </p>
        </div>
        <span className="text-[var(--muted)]">{open ? "▾" : "▸"}</span>
      </button>

      {open ? (
        <div className="border-t border-[var(--border)]">
          <div className="flex justify-end border-b border-[var(--border)] px-4 py-2">
            <Link
              href={`/imports/${imp.id}`}
              className="text-[12px] font-medium text-[var(--accent)] hover:underline"
            >
              Open import
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {rows.map((row) => (
              <AmbiguousRow key={row.id} row={row} profileNames={profileNames} onRefresh={() => router.refresh()} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AmbiguousRow({
  row,
  profileNames,
  onRefresh,
}: {
  row: UnresolvedImportGroup["rows"][number];
  profileNames: Record<string, string>;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[var(--background)]">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium",
            "border-[var(--red)]/50 bg-[var(--red-bg)] text-[var(--red)]",
          )}
        >
          Ambiguous · expand
        </button>
        <span className="font-mono text-[12px] text-[var(--secondary)]">{row.office}</span>
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-250 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {expanded ? (
            <ImportRowExpansion
              row={row}
              profileNames={profileNames}
              mode="ambiguous"
              onCancel={() => setExpanded(false)}
              onChanged={() => {
                setExpanded(false);
                onRefresh();
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
