import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { MyRequestsView } from "./my-requests-view";

export default async function MyRequestsPage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (ctx.isTerritoryTeam) {
    redirect("/dashboard");
  }

  return <MyRequestsView />;
}
