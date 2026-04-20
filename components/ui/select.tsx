import * as React from "react";

import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  className,
  options,
  placeholder,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full appearance-none rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-[9px] text-[13px] text-[var(--foreground)] outline-none transition-[border-color] duration-150 hover:border-[var(--border-hover)] focus-visible:border-[var(--accent)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {placeholder ? (
        <option value="">{placeholder}</option>
      ) : null}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
