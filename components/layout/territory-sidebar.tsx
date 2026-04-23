"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
      {children}
    </span>
  );
}

function sectionLabel(text: string) {
  return (
    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
      {text}
    </p>
  );
}

function NavLink({
  href,
  label,
  active,
  badge,
  badgeVariant,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
  badgeVariant?: "red" | "neutral";
  icon?: React.ReactNode;
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
        {icon ?? (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="8" cy="8" r="6" />
          </svg>
        )}
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

export function TerritorySidebar({
  newCount,
  slaAlertCount,
}: {
  newCount: number;
  slaAlertCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slaParam = searchParams.get("sla");

  const onDashboard = pathname === "/dashboard";
  const onDashboardDefault = onDashboard && slaParam !== "alerts";
  const onSlaAlerts = onDashboard && slaParam === "alerts";
  const onAllRequests = pathname === "/requests";
  const onReports = pathname === "/reports";
  const onImports = pathname === "/imports" || pathname.startsWith("/imports/");

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] px-3 py-6">
      <div className="mb-8 px-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          LRT
        </p>
        <p className="text-[15px] font-semibold text-[var(--foreground)]">
          Lead Request Tracker
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div>
          {sectionLabel("Overview")}
          <NavLink
            href="/dashboard"
            label="Dashboard"
            active={onDashboardDefault}
            badge={newCount}
            badgeVariant="red"
          />
        </div>

        <div>
          {sectionLabel("Requests")}
          <NavLink href="/requests" label="All Requests" active={onAllRequests} />
          <NavLink
            href="/dashboard?sla=alerts"
            label="SLA Alerts"
            active={onSlaAlerts}
            badge={slaAlertCount}
            badgeVariant="red"
          />
        </div>

        <div>
          {sectionLabel("Reporting")}
          <NavLink href="/reports" label="Analytics" active={onReports} />
        </div>

        <div>
          {sectionLabel("Imports")}
          <NavLink href="/imports" label="All Imports" active={onImports} />
        </div>
      </nav>
    </aside>
  );
}
