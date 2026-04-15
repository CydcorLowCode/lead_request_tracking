import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";

export default async function SlaSettingsPage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.isTerritoryTeam) {
    redirect("/my-requests");
  }

  const supabase = await createClient();
  const { data: configs } = await supabase
    .from("lrt_sla_configs")
    .select("*")
    .order("campaign_id", { ascending: true });

  return (
    <PageShell title="SLA settings">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Rows from{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          lrt_sla_configs
        </code>{" "}
        (territory team only via RLS).
      </p>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        {(configs ?? []).length} config row(s) visible.
      </p>
    </PageShell>
  );
}
