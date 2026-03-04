import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { navLinks } from "@/app/data/content";
import { cn } from "@/app/lib/cn";

type PageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  overlay?: ReactNode;
};

const defaultMainClassName = "relative z-10 mx-auto w-full flex-1 max-w-6xl space-y-6 px-5 pb-24 pt-10";

export function PageShell({ children, mainClassName, overlay }: PageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {overlay}
      <Header navLinks={navLinks} />
      <main className={cn(defaultMainClassName, mainClassName)}>{children}</main>
      <Footer />
    </div>
  );
}

