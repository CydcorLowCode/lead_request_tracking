import { notFound, redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { RequestDetailView } from "./request-detail-view";

type Props = { params: Promise<{ id: string }> };

type OwnerProfileRow = Pick<
  Tables<"lrt_profiles">,
  "id" | "full_name" | "email" | "role"
>;

type OwnerProfileSlot =
  | { status: "ok"; profile: OwnerProfileRow | null }
  | { status: "forbidden" };

export default async function RequestDetailPage({ params }: Props) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  if (ctx.profile.role !== "owner" && ctx.profile.role !== "territory_team") {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();

  const rowPromise = Promise.resolve(
    supabase.from("lrt_lead_requests").select("*").eq("id", id).maybeSingle(),
  );

  const [rowRes, auditRes, slaRes, ownerSlot] = await Promise.all([
    rowPromise,
    supabase
      .from("lrt_audit_log")
      .select("*")
      .eq("request_id", id)
      .order("changed_at", { ascending: false }),
    supabase
      .from("lrt_sla_configs")
      .select("campaign_id, lead_type, warning_hours"),
    rowPromise.then(async (res): Promise<OwnerProfileSlot> => {
      const { data: row, error } = res;
      if (error || !row) {
        return { status: "ok", profile: null };
      }
      if (ctx.profile.role === "owner" && row.owner_id !== ctx.profile.id) {
        return { status: "forbidden" };
      }
      if (row.owner_id === ctx.profile.id) {
        return {
          status: "ok",
          profile: {
            id: ctx.profile.id,
            full_name: ctx.profile.full_name,
            email: ctx.profile.email,
            role: ctx.profile.role,
          },
        };
      }
      const { data } = await supabase
        .from("lrt_profiles")
        .select("id, full_name, email, role")
        .eq("id", row.owner_id)
        .maybeSingle();
      return { status: "ok", profile: data };
    }),
  ]);

  const { data: row, error: rowError } = rowRes;
  if (rowError || !row) notFound();
  if (ownerSlot.status === "forbidden") notFound();

  const ownerProfile = ownerSlot.profile;

  return (
    <RequestDetailView
      row={row}
      ownerProfile={ownerProfile}
      auditLog={auditRes.data ?? []}
      slaConfigs={slaRes.data ?? []}
      currentProfile={{
        id: ctx.profile.id,
        full_name: ctx.profile.full_name,
        email: ctx.profile.email,
        role: ctx.profile.role,
      }}
    />
  );
}
