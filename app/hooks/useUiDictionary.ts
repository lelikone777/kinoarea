"use client";

import { useMemo } from "react";
import { getUiDictionary } from "../lib/i18n";
import { useSiteLanguage } from "./useSiteLanguage";

export function useUiDictionary() {
  const { language, setLanguage } = useSiteLanguage();
  const dictionary = useMemo(() => getUiDictionary(language), [language]);
  return { language, setLanguage, dictionary };
}

