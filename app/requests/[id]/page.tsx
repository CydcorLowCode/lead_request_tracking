import { notFound, redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import { RequestDetailView } from "./request-detail-view";

type Props = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: Props) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: row, error: rowError },
    { data: auditLog },
    { data: slaConfigs },
  ] = await Promise.all([
    supabase.from("lrt_lead_requests").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("lrt_audit_log")
      .select("*")
      .eq("request_id", id)
      .order("changed_at", { ascending: false }),
    supabase.from("lrt_sla_configs").select("campaign_id, lead_type, warning_hours"),
  ]);

  if (rowError || !row) notFound();

  // Owners can only see their own requests
  if (ctx.profile.role === "owner" && row.owner_id !== ctx.profile.id) {
    notFound();
  }

  let ownerProfile = null;
  if (row.owner_id !== ctx.profile.id) {
    const { data } = await supabase
      .from("lrt_profiles")
      .select("id, full_name, email, role")
      .eq("id", row.owner_id)
      .maybeSingle();
    ownerProfile = data;
  } else {
    ownerProfile = {
      id: ctx.profile.id,
      full_name: ctx.profile.full_name,
      email: ctx.profile.email,
      role: ctx.profile.role,
    };
  }

  return (
    <RequestDetailView
      row={row}
      ownerProfile={ownerProfile}
      auditLog={auditLog ?? []}
      slaConfigs={slaConfigs ?? []}
      currentProfile={{
        id: ctx.profile.id,
        full_name: ctx.profile.full_name,
        email: ctx.profile.email,
        role: ctx.profile.role,
      }}
    />
  );
}