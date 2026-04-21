import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";

import { AttImportView } from "./att-import-view";

export default async function AttImportPage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.isTerritoryTeam) {
    redirect("/my-requests");
  }

  return <AttImportView />;
}
