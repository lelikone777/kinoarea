import type { SiteLanguage } from "./language";

type NounForms = {
  ru: [one: string, few: string, many: string];
  other: [one: string, many: string];
};

function getRuPluralFormIndex(value: number) {
  const n = Math.abs(value);
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 0;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 1;
  }
  return 2;
}

export function pluralizeByLanguage(value: number, language: SiteLanguage, forms: NounForms) {
  if (language === "ru-RU") {
    return forms.ru[getRuPluralFormIndex(value)];
  }
  return Math.abs(value) === 1 ? forms.other[0] : forms.other[1];
}

export function formatCountWithNoun(value: number, language: SiteLanguage, forms: NounForms) {
  const formattedValue = value.toLocaleString(language);
  const noun = pluralizeByLanguage(value, language, forms);
  return `${formattedValue} ${noun}`;
}
