import * as React from "react";

import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-[12px] font-medium leading-none text-[var(--secondary)]",
        className,
      )}
      {...props}
    />
  );
}
