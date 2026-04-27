import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";

export default async function Home() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (ctx.isTerritoryTeam) {
    redirect("/dashboard");
  }
  redirect("/home");
}
