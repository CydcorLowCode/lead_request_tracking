import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[13px] text-[var(--foreground)] outline-none transition-[border-color] duration-150 placeholder:text-[var(--muted)] hover:border-[var(--border-hover)] focus-visible:border-[var(--accent)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
