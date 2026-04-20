import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-[9px] text-[13px] text-[var(--foreground)] outline-none transition-[border-color] duration-150 placeholder:text-[var(--muted)] hover:border-[var(--border-hover)] focus-visible:border-[var(--accent)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
