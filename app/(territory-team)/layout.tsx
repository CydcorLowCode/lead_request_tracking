import { Suspense } from "react";

import { TerritorySidebar } from "@/components/layout/territory-sidebar";
import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";

export default async function TerritoryTeamGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();

  if (!ctx?.isTerritoryTeam) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("lrt_import_rows")
    .select("*", { count: "exact", head: true })
    .eq("match_status", "ambiguous_unresolved");

  const unresolvedCount = count ?? 0;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Suspense
        fallback={
          <aside className="sticky top-0 h-screen w-[240px] shrink-0 border-r border-[var(--border)] bg-[var(--card)]" />
        }
      >
        <TerritorySidebar unresolvedCount={unresolvedCount} />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
