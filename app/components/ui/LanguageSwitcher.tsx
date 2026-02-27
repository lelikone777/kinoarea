"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/app/lib/cn";
import { useSiteLanguage } from "@/app/hooks/useSiteLanguage";
import { SUPPORTED_SITE_LANGUAGES, type SiteLanguage } from "@/app/lib/language";
import { StyledSelect } from "./StyledSelect";

const LABELS: Record<SiteLanguage, string> = {
  "ru-RU": "RU",
  "en-US": "EN",
  "pt-BR": "PT",
  "es-ES": "ES",
  "de-DE": "DE",
};

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const { language, setLanguage } = useSiteLanguage();
  const options = SUPPORTED_SITE_LANGUAGES.map((lang) => ({
    value: lang,
    label: LABELS[lang],
  }));

  return (
    <StyledSelect
      value={language}
      onChange={(nextValue) => {
        const nextLanguage = nextValue as SiteLanguage;
        setLanguage(nextLanguage);
        router.refresh();
      }}
      options={options}
      placeholder={LABELS[language]}
      dropdownWidth="content"
      selectedIndicator="none"
      className={cn("w-[78px]", className)}
    />
  );
}
