export const SITE_LANGUAGE_COOKIE = "site_lang";
export const SUPPORTED_SITE_LANGUAGES = ["ru-RU", "en-US", "pt-BR"] as const;
const DEFAULT_SITE_LANGUAGE = "ru-RU" as const;

export type SiteLanguage = (typeof SUPPORTED_SITE_LANGUAGES)[number];

const supportedLanguagesSet = new Set<string>(SUPPORTED_SITE_LANGUAGES);
const supportedLanguageByLowercase = new Map(
  SUPPORTED_SITE_LANGUAGES.map((language) => [language.toLowerCase(), language] as const),
);
const supportedLanguageByBase = new Map(
  SUPPORTED_SITE_LANGUAGES.map((language) => [language.split("-")[0]?.toLowerCase() ?? "", language] as const),
);

export function isSiteLanguage(value: string): value is SiteLanguage {
  return supportedLanguagesSet.has(value);
}

export function normalizeSiteLanguage(value?: string | null): SiteLanguage {
  if (value && isSiteLanguage(value)) {
    return value;
  }
  return DEFAULT_SITE_LANGUAGE;
}

export function getLanguageBase(siteLanguage: SiteLanguage) {
  return siteLanguage.split("-")[0] || "ru";
}

export function detectSiteLanguageFromAcceptLanguage(acceptLanguage?: string | null): SiteLanguage | null {
  if (!acceptLanguage) {
    return null;
  }

  const candidates = acceptLanguage
    .split(",")
    .map((entry) => {
      const [rawLanguage, ...params] = entry.trim().split(";");
      const language = rawLanguage?.trim().toLowerCase();
      if (!language || language === "*") {
        return null;
      }

      const qParam = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.slice(2)) : 1;

      return {
        language,
        quality: Number.isFinite(quality) ? quality : 1,
      };
    })
    .filter((candidate): candidate is { language: string; quality: number } => candidate !== null)
    .sort((a, b) => b.quality - a.quality);

  for (const candidate of candidates) {
    const exactMatch = supportedLanguageByLowercase.get(candidate.language);
    if (exactMatch) {
      return exactMatch;
    }

    const baseLanguage = candidate.language.split("-")[0];
    if (!baseLanguage) {
      continue;
    }
    const baseMatch = supportedLanguageByBase.get(baseLanguage);
    if (baseMatch) {
      return baseMatch;
    }
  }

  return null;
}

export function resolveSiteLanguage(input: { cookieLanguage?: string | null; acceptLanguage?: string | null }): SiteLanguage {
  if (input.cookieLanguage && isSiteLanguage(input.cookieLanguage)) {
    return input.cookieLanguage;
  }

  return detectSiteLanguageFromAcceptLanguage(input.acceptLanguage) ?? DEFAULT_SITE_LANGUAGE;
}
