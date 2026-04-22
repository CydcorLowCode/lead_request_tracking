import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { PageShell } from "@/components/layout/page-shell";

export default async function ReportsPage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.isTerritoryTeam) {
    redirect("/my-requests");
  }

  return (
    <PageShell title="Reports">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Export and reporting UI will be implemented here.
      </p>
    </PageShell>
  );
}
