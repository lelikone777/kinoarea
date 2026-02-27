import type { ReactNode } from "react";
import { cn } from "@/app/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function InfoCard({ children, className }: CardProps) {
  return <div className={cn("rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300", className)}>{children}</div>;
}

export function ErrorCard({ children, className }: CardProps) {
  return <div className={cn("rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-rose-200", className)}>{children}</div>;
}

export function PanelCard({ children, className }: CardProps) {
  return <div className={cn("rounded-3xl border border-white/10 bg-slate-900/60 p-6", className)}>{children}</div>;
}

