export const SITE_LANGUAGE_COOKIE = "site_lang";
export const SUPPORTED_SITE_LANGUAGES = ["ru-RU", "en-US"] as const;

export type SiteLanguage = (typeof SUPPORTED_SITE_LANGUAGES)[number];

const supportedLanguagesSet = new Set<string>(SUPPORTED_SITE_LANGUAGES);

export function isSiteLanguage(value: string): value is SiteLanguage {
  return supportedLanguagesSet.has(value);
}

export function normalizeSiteLanguage(value?: string | null): SiteLanguage {
  if (value && isSiteLanguage(value)) {
    return value;
  }
  return "ru-RU";
}

export function getLanguageBase(siteLanguage: SiteLanguage) {
  return siteLanguage.split("-")[0] || "ru";
}

