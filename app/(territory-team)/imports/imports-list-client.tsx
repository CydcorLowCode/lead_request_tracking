"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import type { UnresolvedImportGroup } from "@/app/imports/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative";

import type { ImportListRow } from "./data";
import { UnresolvedGroupCard } from "./unresolved-group";

function ImportStatusChip({ status }: { status: string }) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium";
  if (status === "parsing") {
    return (
      <span className={cn(base, "bg-[var(--amber-bg)] text-[var(--amber)]")}>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />
        Parsing
      </span>
    );
  }
  if (status === "preview") {
    return (
      <span className={cn(base, "bg-[var(--blue-bg)] text-[var(--accent)]")}>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Preview
      </span>
    );
  }
  if (status === "committed") {
    return (
      <span className={cn(base, "bg-[var(--green-bg)] text-[var(--green)]")}>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
        Committed
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className={cn(base, "bg-[var(--input)] text-[var(--muted)]")}>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
        Cancelled
      </span>
    );
  }
  return (
    <span className={cn(base, "bg-[var(--input)] text-[var(--secondary)]")}>{status}</span>
  );
}

function BucketChips({ rowCounts }: { rowCounts: Record<string, number> }) {
  const parts: { label: string; n: number; className: string }[] = [];
  const add = (k: string, label: string, className: string) => {
    const n = rowCounts[k] ?? 0;
    if (n) parts.push({ label, n, className });
  };
  add("matched", "M", "text-[var(--green)]");
  add("new", "N", "text-[var(--amber)]");
  add("ambiguous_unresolved", "A", "text-[var(--red)]");
  add("error", "E", "text-[var(--amber)]");
  if (parts.length === 0) {
    return <span className="text-[12px] text-[var(--muted)]">—</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      {parts.map((p) => (
        <span key={p.label} className={cn("font-mono text-[11px] leading-tight", p.className)}>
          {p.label} {p.n}
        </span>
      ))}
    </div>
  );
}

export function ImportsListClient({
  tab,
  page,
  pageSize,
  totalImports,
  recentRows,
  allRows,
  unresolvedGroups,
}: {
  tab: string;
  page: number;
  pageSize: number;
  totalImports: number;
  recentRows: ImportListRow[];
  allRows: ImportListRow[];
  unresolvedGroups: UnresolvedImportGroup[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setTab = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === "recent") {
        next.delete("tab");
      } else {
        next.set("tab", value);
      }
      next.delete("page");
      router.replace(`/imports?${next.toString()}`);
    },
    [router, searchParams],
  );

  const totalPages = Math.max(1, Math.ceil(totalImports / pageSize));
  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", "all");
    next.set("page", String(p));
    router.replace(`/imports?${next.toString()}`);
  };

  const currentTab =
    tab === "unresolved" || tab === "all" ? tab : "recent";

  const emptyAll = totalImports === 0;

  return (
    <div>
      <Tabs value={currentTab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="recent" className="data-[state=active]:ring-[var(--accent)]">
            Recent
          </TabsTrigger>
          <TabsTrigger value="unresolved" className="data-[state=active]:ring-[var(--red)]/40">
            Unresolved
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:ring-[var(--accent)]">
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-0">
          {emptyAll ? (
            <EmptyNoImports />
          ) : (
            <ImportsTable rows={recentRows} showResume />
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          {emptyAll ? (
            <EmptyNoImports />
          ) : (
            <>
              <ImportsTable rows={allRows} showResume />
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-[13px] text-[var(--muted)]">
                  Page {page} of {totalPages} · {totalImports} imports
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-[6px] border border-[var(--border)] px-3 py-1.5 text-[13px] text-[var(--secondary)] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-[6px] border border-[var(--border)] px-3 py-1.5 text-[13px] text-[var(--secondary)] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="unresolved" className="mt-0">
          {unresolvedGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
              <span className="mb-3 text-[var(--green)]" aria-hidden>
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-[15px] font-medium text-[var(--foreground)]">All caught up</p>
              <p className="mt-1 max-w-md text-[13px] text-[var(--muted)]">
                No ambiguous rows awaiting resolution.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unresolvedGroups.map((g) => (
                <UnresolvedGroupCard key={g.import.id} group={g} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyNoImports() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
      <p className="text-[15px] font-medium text-[var(--foreground)]">No imports yet</p>
      <p className="mt-1 max-w-md text-[13px] text-[var(--muted)]">
        Upload your first AT&amp;T report to get started.
      </p>
      <Link
        href="/imports/new"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-5 text-[13px] font-medium text-white"
      >
        Upload report
      </Link>
    </div>
  );
}

function ImportsTable({ rows, showResume }: { rows: ImportListRow[]; showResume?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Uploaded</TableHead>
            <TableHead>By</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Rows</TableHead>
            <TableHead>Buckets</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ import: imp, rowCounts, totalRows }) => (
            <TableRow key={imp.id} className="cursor-pointer hover:bg-[var(--input)]/40">
              <TableCell>
                <Link href={`/imports/${imp.id}`} className="block font-mono text-[12px] text-[var(--foreground)]">
                  {formatRelativeTime(imp.created_at)}
                </Link>
              </TableCell>
              <TableCell className="text-[13px] text-[var(--secondary)]">{imp.uploader_name ?? "—"}</TableCell>
              <TableCell className="max-w-[200px] truncate font-mono text-[12px]" title={imp.file_name ?? ""}>
                <Link href={`/imports/${imp.id}`} className="text-[var(--accent)] hover:underline">
                  {imp.file_name ?? "—"}
                </Link>
              </TableCell>
              <TableCell className="font-mono text-[12px]">{totalRows}</TableCell>
              <TableCell>
                <BucketChips rowCounts={rowCounts} />
              </TableCell>
              <TableCell>
                <ImportStatusChip status={imp.status} />
              </TableCell>
              <TableCell className="text-right">
                {showResume && imp.status === "preview" ? (
                  <Link
                    href={`/imports/${imp.id}`}
                    className="text-[12px] font-medium text-[var(--accent)] hover:underline"
                  >
                    Resume
                  </Link>
                ) : (
                  <Link href={`/imports/${imp.id}`} className="text-[12px] text-[var(--secondary)] hover:text-[var(--foreground)]">
                    Open
                  </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
