import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";

type Props = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: Props) {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("lrt_lead_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  return (
    <PageShell title={`Request ${row.id.slice(0, 8)}…`}>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Status</dt>
          <dd className="font-medium">{row.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Lead type</dt>
          <dd className="font-medium">{row.lead_type}</dd>
        </div>
      </dl>
      <p className="text-xs text-zinc-500">
        Audit changes via{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          lrt_append_audit_log
        </code>{" "}
        only.
      </p>
      <Link href="/dashboard" className="text-sm font-medium underline">
        Back
      </Link>
    </PageShell>
  );
}
