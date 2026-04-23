import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";

import { ReportsView } from "./reports-view";

export default async function ReportsPage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.isTerritoryTeam) {
    redirect("/my-requests");
  }

  return <ReportsView />;
}
