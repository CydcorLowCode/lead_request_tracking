import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";

import { OwnerHomeView } from "./owner-home-view";

export default async function OwnerHomePage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (ctx.isTerritoryTeam) {
    redirect("/dashboard");
  }

  const firstName = ctx.profile.full_name?.split(" ")[0]?.trim() || "there";

  return <OwnerHomeView firstName={firstName} />;
}
