import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { DashboardView } from "../dashboard/dashboard-view";

export default async function AllRequestsPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.isTerritoryTeam) redirect("/my-requests");
  return <DashboardView showAttImportLink={ctx.isTerritoryTeam} initialScope="all" />;
}
