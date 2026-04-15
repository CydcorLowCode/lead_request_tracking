"use client";

import { useFormStatus } from "react-dom";

import { logout } from "@/app/logout/actions";
import { cn } from "@/lib/utils";

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Signing out..." : "Logout"}
    </button>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logout}>
      <SubmitButton className={className} />
    </form>
  );
}
