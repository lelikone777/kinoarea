"use client";

import { useContext } from "react";
import { SiteLanguageContext } from "@/app/components/providers/SiteLanguageProvider";

export function useSiteLanguage() {
  const context = useContext(SiteLanguageContext);
  if (!context) {
    throw new Error("useSiteLanguage must be used within SiteLanguageProvider.");
  }
  return context;
}
