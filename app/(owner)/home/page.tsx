import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";

export default async function OwnerHomePage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (ctx.isTerritoryTeam) {
    redirect("/dashboard");
  }

  const firstName = ctx.profile.full_name?.split(" ")[0]?.trim() || "there";

  return (
    <main className="flex w-full flex-col gap-6 px-8 py-8">
      <h1 className="text-[20px] font-semibold tracking-tight text-[var(--foreground)]">
        Welcome, {firstName}
      </h1>
      <p className="max-w-xl text-sm text-[var(--secondary)]">
        This is your home in Lead Request Tracker. Use the sidebar to open your requests or submit a
        new lead request.
      </p>
    </main>
  );
}
