import * as React from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "h-10 w-full animate-pulse rounded-[6px] border border-[var(--border)] bg-[var(--input)]",
        className,
      )}
      {...props}
    />
  );
}
