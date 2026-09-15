export const LOCALES = ["ru", "kk", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export type LocalizedString = string | Partial<Record<Locale, string>>;

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Русский",
  kk: "Қазақша",
  en: "English",
};
