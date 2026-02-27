import { normalizeSiteLanguage, type SiteLanguage } from "./language";
import { enDictionary } from "./i18n/dictionaries/en-US";
import { ptDictionary } from "./i18n/dictionaries/pt-BR";
import { ruDictionary } from "./i18n/dictionaries/ru-RU";
import type { UiDictionary } from "./i18n/types";

export type { UiDictionary } from "./i18n/types";

const dictionaries: Record<SiteLanguage, UiDictionary> = {
  "ru-RU": ruDictionary,
  "en-US": enDictionary,
  "pt-BR": ptDictionary,
};

export function getUiDictionary(language: SiteLanguage) {
  return dictionaries[normalizeSiteLanguage(language)];
}
