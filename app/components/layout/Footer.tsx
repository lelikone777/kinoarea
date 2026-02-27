"use client";

import Image from "next/image";
import { useUiDictionary } from "@/app/hooks/useUiDictionary";

export function Footer() {
  const { dictionary } = useUiDictionary();

  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-950/90 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl">
            <Image src="/logo-kinoera.png" alt="KinoEra logo" fill sizes="40px" className="object-cover" />
          </div>
          <div>
            <p className="text-base font-bold text-white">КиноЭра</p>
            <p className="text-xs text-slate-500">{dictionary.footer.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          {dictionary.footer.links.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="text-xs text-slate-500">{dictionary.footer.copyright}</p>
      </div>
    </footer>
  );
}

