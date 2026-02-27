"use client";

import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE, type SiteLanguage } from "@/app/lib/language";

type SiteLanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (nextLanguage: SiteLanguage) => void;
};

export const SiteLanguageContext = createContext<SiteLanguageContextValue | null>(null);

type SiteLanguageProviderProps = {
  initialLanguage: SiteLanguage;
  children: ReactNode;
};

export function SiteLanguageProvider({ initialLanguage, children }: SiteLanguageProviderProps) {
  const [language, setLanguageState] = useState<SiteLanguage>(initialLanguage);

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    const normalized = normalizeSiteLanguage(nextLanguage);
    document.cookie = `${SITE_LANGUAGE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=31536000; samesite=lax`;
    setLanguageState(normalized);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return <SiteLanguageContext.Provider value={value}>{children}</SiteLanguageContext.Provider>;
}
