"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
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
    </Link>
  );
}

const iconHome = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <rect x="2" y="2" width="5" height="5" rx="0.5" />
    <rect x="9" y="2" width="5" height="5" rx="0.5" />
    <rect x="2" y="9" width="5" height="5" rx="0.5" />
    <rect x="9" y="9" width="5" height="5" rx="0.5" />
  </svg>
);

const iconList = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="3" y1="8" x2="13" y2="8" />
    <line x1="3" y1="12" x2="10" y2="12" />
  </svg>
);

const iconSubmit = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="11" strokeLinecap="round" />
    <line x1="5" y1="8" x2="11" y2="8" strokeLinecap="round" />
  </svg>
);

export function OwnerSidebar() {
  const pathname = usePathname();
  const onHome = pathname === "/home";
  const onMyRequests = pathname === "/my-requests";
  const onSubmit = pathname === "/submit" || pathname.startsWith("/submit/");

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] px-3 py-6">
      <div className="mb-8 px-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">LRT</p>
        <p className="text-[15px] font-semibold text-[var(--foreground)]">Lead Request Tracker</p>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div>
          {sectionLabel("Overview")}
          <NavLink href="/home" label="Home" active={onHome} icon={iconHome} />
        </div>

        <div>
          {sectionLabel("Requests")}
          <NavLink href="/my-requests" label="My Requests" active={onMyRequests} icon={iconList} />
          <NavLink href="/submit" label="Submit Request" active={onSubmit} icon={iconSubmit} />
        </div>
      </nav>

      <div className="mt-auto border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-2 px-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
