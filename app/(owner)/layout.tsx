import { Suspense } from "react";

import { OwnerSidebar } from "@/components/layout/owner-sidebar";
import { getSessionContext } from "@/lib/auth/get-session-user";

export default async function OwnerGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();

  if (!ctx) {
    return <>{children}</>;
  }

  if (ctx.isTerritoryTeam) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Suspense
        fallback={
          <aside className="sticky top-0 h-screen w-[240px] shrink-0 border-r border-[var(--border)] bg-[var(--card)]" />
        }
      >
        <OwnerSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
