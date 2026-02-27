"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/app/lib/cn";

export type StyledSelectOption = {
  value: string;
  label: string;
};

type StyledSelectProps = {
  value: string;
  onChange: (nextValue: string) => void;
  options: StyledSelectOption[];
  placeholder: string;
  className?: string;
  dropdownWidth?: "trigger" | "content";
  selectedIndicator?: "label" | "check" | "none";
  selectedLabel?: string;
};

export function StyledSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  dropdownWidth = "trigger",
  selectedIndicator = "label",
  selectedLabel = "Выбрано",
}: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-left text-sm text-white transition hover:border-sky-300/50"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-300 transition ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            fill="currentColor"
            d="M6.7 8.8a1 1 0 0 1 1.4 0L12 12.7l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.2a1 1 0 0 1 0-1.4Z"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className={cn(
            "hide-scrollbar absolute top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl shadow-sky-900/20 backdrop-blur",
            dropdownWidth === "trigger" ? "left-0 right-0" : "left-0 w-max min-w-max",
          )}
        >
          {options.map((option) => (
            <button
              key={option.value || "__empty"}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`mb-1 flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm transition last:mb-0 ${
                value === option.value
                  ? "bg-sky-400 font-semibold text-slate-950"
                  : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <span className={cn(dropdownWidth === "content" ? "whitespace-nowrap" : "truncate")}>
                {option.label}
              </span>
              {value === option.value && selectedIndicator === "label" ? (
                <span className="text-xs font-bold whitespace-nowrap">{selectedLabel}</span>
              ) : null}
              {value === option.value && selectedIndicator === "check" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0">
                  <path
                    fill="currentColor"
                    d="M9.6 16.8a1 1 0 0 1-.7-.3l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 7-7a1 1 0 0 1 1.4 1.4l-7.7 7.7a1 1 0 0 1-.7.3Z"
                  />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

