import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { UrlObject } from "url";
import { cn } from "@/app/lib/cn";

export const buttonStyles = {
  base: "inline-flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-sky-300/60 disabled:cursor-not-allowed disabled:opacity-50",
  cta: "rounded-xl bg-white px-4 py-2 text-sm font-semibold !text-slate-900 !no-underline shadow-lg shadow-sky-500/25 hover:-translate-y-0.5 hover:opacity-95 hover:!text-slate-900 visited:!text-slate-900",
  secondary: "rounded-2xl border border-white/15 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-white hover:border-white/40",
  icon: "h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10",
  sectionListLink: "group rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-white/40",
  smallOutline: "rounded-lg border border-white/15 px-2.5 py-1.5 text-xs hover:border-white/40 disabled:opacity-40",
  smallSolid: "rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50",
} as const;

export type ButtonVariant = Exclude<keyof typeof buttonStyles, "base">;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "secondary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles.base, buttonStyles[variant], className)} {...props} />;
}

type LinkButtonProps = {
  href: string | UrlObject;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  ariaLabel?: string;
};

export function LinkButton({ href, children, className, variant = "secondary", ariaLabel }: LinkButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(buttonStyles.base, buttonStyles[variant], className)}
    >
      {children}
    </Link>
  );
}
