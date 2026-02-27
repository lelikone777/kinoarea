"use client";

import type { FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/app/lib/cn";

type FilterWidgetBaseProps = {
  children: ReactNode;
  className?: string;
};

export function FilterWidget({ children, className }: FilterWidgetBaseProps) {
  return (
    <div className={cn("grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4", className)}>
      {children}
    </div>
  );
}

type FilterWidgetFormProps = FilterWidgetBaseProps & FormHTMLAttributes<HTMLFormElement>;

export function FilterWidgetForm({ children, className, ...props }: FilterWidgetFormProps) {
  return (
    <form
      {...props}
      className={cn("grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4", className)}
    >
      {children}
    </form>
  );
}

type FilterWidgetFieldProps = FilterWidgetBaseProps & HTMLAttributes<HTMLDivElement>;

export function FilterWidgetField({ children, className, ...props }: FilterWidgetFieldProps) {
  return (
    <div {...props} className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}

type FilterWidgetCheckboxProps = {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  label: string;
  className?: string;
};

export function FilterWidgetCheckbox({ checked, onChange, label, className }: FilterWidgetCheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-sky-400"
      />
      {label}
    </label>
  );
}

type FilterWidgetTagOption = {
  value: string;
  label: string;
};

type FilterWidgetTagCloudProps = {
  value: string;
  onChange: (nextValue: string) => void;
  options: FilterWidgetTagOption[];
  className?: string;
};

export function FilterWidgetTagCloud({ value, onChange, options, className }: FilterWidgetTagCloudProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold transition",
            value === option.value
              ? "bg-sky-400 text-slate-950"
              : "bg-white/5 text-slate-200 hover:bg-white/10"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
