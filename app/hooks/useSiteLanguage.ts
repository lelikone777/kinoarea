"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE, type SiteLanguage } from "../lib/language";

function readLanguageFromCookie() {
  if (typeof document === "undefined") {
    return "ru-RU" as SiteLanguage;
  }

  const cookiePair = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${SITE_LANGUAGE_COOKIE}=`));

  if (!cookiePair) {
    return "ru-RU";
  }

  const value = decodeURIComponent(cookiePair.split("=")[1] || "");
  return normalizeSiteLanguage(value);
}

export function useSiteLanguage() {
  const [language, setLanguageState] = useState<SiteLanguage>(() => readLanguageFromCookie());

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    document.cookie = `${SITE_LANGUAGE_COOKIE}=${encodeURIComponent(nextLanguage)}; path=/; max-age=31536000; samesite=lax`;
    setLanguageState(nextLanguage);
    window.dispatchEvent(new CustomEvent("site-language-change", { detail: nextLanguage }));
  }, []);

  useEffect(() => {
    const handler = () => {
      setLanguageState(readLanguageFromCookie());
    };

    window.addEventListener("site-language-change", handler);
    return () => window.removeEventListener("site-language-change", handler);
  }, []);

  return { language, setLanguage };
}
