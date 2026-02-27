import { normalizeSiteLanguage, type SiteLanguage } from "./language";
import { deDictionary } from "./i18n/dictionaries/de-DE";
import { enDictionary } from "./i18n/dictionaries/en-US";
import { esDictionary } from "./i18n/dictionaries/es-ES";
import { ptDictionary } from "./i18n/dictionaries/pt-BR";
import { ruDictionary } from "./i18n/dictionaries/ru-RU";
import type { UiDictionary } from "./i18n/types";

export type { UiDictionary } from "./i18n/types";

const dictionaries: Record<SiteLanguage, UiDictionary> = {
  "ru-RU": ruDictionary,
  "en-US": enDictionary,
  "pt-BR": ptDictionary,
  "es-ES": esDictionary,
  "de-DE": deDictionary,
};

export function getUiDictionary(language: SiteLanguage) {
  return dictionaries[normalizeSiteLanguage(language)];
}
