"use client";

import Image from "next/image";
import Link from "next/link";
import { useUiDictionary } from "@/app/hooks/useUiDictionary";
import { navLinks } from "@/app/data/content";

export function Footer() {
  const { dictionary } = useUiDictionary();
  const currentYear = new Date().getFullYear();
  const normalizedCopyright = dictionary.footer.copyright
    .replace(/\(c\)|©/gi, "")
    .replace(/\b20\d{2}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-950/90 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex cursor-pointer items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl">
            <Image src="/logo-kinoera.png" alt="KinoEra logo" fill sizes="40px" className="object-cover" />
          </div>
          <div>
            <p className="text-base font-bold text-white">КиноЭра</p>
            <p className="text-xs text-slate-500">{dictionary.footer.subtitle}</p>
          </div>
        </Link>

        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative inline-flex -translate-x-0 items-center text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:translate-x-0.5 hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-sky-300 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-500">{`${currentYear} ${normalizedCopyright}`}</p>
      </div>
    </footer>
  );
}
