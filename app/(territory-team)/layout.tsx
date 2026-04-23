import { Suspense } from "react";

import { TerritorySidebar } from "@/components/layout/territory-sidebar";
import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import { TERMINAL_REQUEST_STATUSES } from "@/lib/sla/evaluate";

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

  const terminalStatuses = Array.from(TERMINAL_REQUEST_STATUSES);
  const nowIso = new Date().toISOString();

  const [newResult, alertResult] = await Promise.all([
    supabase
      .from("lrt_lead_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("lrt_lead_requests")
      .select("*", { count: "exact", head: true })
      .not("status", "in", `(${terminalStatuses.join(",")})`)
      .not("sla_due_at", "is", null)
      .lte("sla_due_at", nowIso),
  ]);

  // NOTE: The SLA alert count above only catches OVERDUE items (sla_due_at in
  // the past) because "at-risk" requires per-lead-type warning hours which
  // aren't easily expressed in a single Supabase filter. That's fine for the
  // sidebar badge — the dashboard itself still computes at-risk client-side.
  // If the team later wants the badge to include at-risk too, we'd either
  // (a) move this count into a Postgres function, or (b) load the rows
  // client-side and count there.

  const newCount = newResult.count ?? 0;
  const slaAlertCount = alertResult.count ?? 0;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Suspense
        fallback={
          <aside className="sticky top-0 h-screen w-[240px] shrink-0 border-r border-[var(--border)] bg-[var(--card)]" />
        }
      >
        <TerritorySidebar newCount={newCount} slaAlertCount={slaAlertCount} />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
