"use client";

import { useRouter } from "next/navigation";
import { useSiteLanguage } from "@/app/hooks/useSiteLanguage";
import { SUPPORTED_SITE_LANGUAGES, type SiteLanguage } from "@/app/lib/language";

const LABELS: Record<SiteLanguage, string> = {
  "ru-RU": "RU",
  "en-US": "EN",
};

export function LanguageSwitcher() {
  const router = useRouter();
  const { language, setLanguage } = useSiteLanguage();

  return (
    <label className="hidden sm:block">
      <span className="sr-only">Язык</span>
      <select
        value={language}
        onChange={(event) => {
          const nextLanguage = event.target.value as SiteLanguage;
          setLanguage(nextLanguage);
          router.refresh();
        }}
        className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
      >
        {SUPPORTED_SITE_LANGUAGES.map((lang) => (
          <option key={lang} value={lang} className="bg-slate-900 text-slate-100">
            {LABELS[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}

