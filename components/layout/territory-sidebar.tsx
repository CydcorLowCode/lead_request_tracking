"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

function NavIcon({ children }: { children: React.ReactNode }) {
  return <span className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">{children}</span>;
}

function sectionLabel(text: string) {
  return (
    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{text}</p>
  );
}

function NavLink({
  href,
  label,
  active,
  badge,
  badgeVariant,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
  badgeVariant?: "red" | "neutral";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium transition-colors",
        active
          ? "bg-[var(--accent-glow)] text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
          : "text-[var(--secondary)] hover:bg-[var(--input)] hover:text-[var(--foreground)]",
      )}
    >
      <NavIcon>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="8" cy="8" r="6" />
        </svg>
      </NavIcon>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 ? (
        <span
          className={cn(
            "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums",
            badgeVariant === "red"
              ? "bg-[var(--red-bg)] text-[var(--red)]"
              : "bg-[var(--input)] text-[var(--muted)]",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function TerritorySidebar({ unresolvedCount }: { unresolvedCount: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const onDashboard = pathname === "/dashboard";
  const onReports = pathname === "/reports";
  const onSubmit = pathname === "/submit";
  const onImports = pathname === "/imports" || pathname.startsWith("/imports/");

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] px-3 py-6">
      <div className="mb-8 px-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Lead Request</p>
        <p className="text-[15px] font-semibold text-[var(--foreground)]">AT&amp;T Residential</p>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div>
          {sectionLabel("Overview")}
          <NavLink href="/dashboard" label="Overview" active={onDashboard} />
          <NavLink href="/dashboard" label="Requests" active={onDashboard} />
        </div>
        <div>
          {sectionLabel("Work")}
          <NavLink href="/reports" label="Reporting" active={onReports} />
          <NavLink href="/submit" label="Submit" active={onSubmit} />
        </div>
        <div>
          {sectionLabel("Imports")}
          <NavLink href="/imports" label="All Imports" active={onImports && tab !== "unresolved"} />
          <NavLink
            href="/imports?tab=unresolved"
            label="Unresolved"
            active={onImports && tab === "unresolved"}
            badge={unresolvedCount}
            badgeVariant="red"
          />
        </div>
      </nav>
    </aside>
  );
}
