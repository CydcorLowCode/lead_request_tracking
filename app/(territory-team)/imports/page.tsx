import Link from "next/link";
import { redirect } from "next/navigation";

import { getUnresolvedImportGroups, type UnresolvedImportGroup } from "@/app/imports/actions";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";

import { countImports, fetchImportListWithBuckets } from "./data";
import { ImportsListClient } from "./imports-list-client";

const PAGE_SIZE = 50;

export default async function ImportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.isTerritoryTeam) {
    redirect("/my-requests");
  }

  const sp = await searchParams;
  const tab = sp.tab ?? "recent";
  const pageNum = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const supabase = await createClient();

  const totalImports = await countImports(supabase);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const [recentRows, allRows] = await Promise.all([
    tab === "recent"
      ? fetchImportListWithBuckets(supabase, { limit: PAGE_SIZE, offset: 0 })
      : Promise.resolve([]),
    tab === "all"
      ? fetchImportListWithBuckets(supabase, { limit: PAGE_SIZE, offset })
      : Promise.resolve([]),
  ]);

  const unresolvedResult =
    tab === "unresolved"
      ? await getUnresolvedImportGroups()
      : { groups: [] as UnresolvedImportGroup[] };
  const unresolvedGroups = "error" in unresolvedResult ? [] : unresolvedResult.groups;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--foreground)]">Imports</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">AT&amp;T NAM report history</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/imports/new"
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent2)]"
          >
            New import
          </Link>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      <ImportsListClient
        tab={tab}
        page={pageNum}
        pageSize={PAGE_SIZE}
        totalImports={totalImports}
        recentRows={recentRows}
        allRows={allRows}
        unresolvedGroups={unresolvedGroups}
      />
    </div>
  );
}
