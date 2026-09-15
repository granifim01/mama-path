"use client";

import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/types";

import { useLocale } from "./LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, ui } = useLocale();

  return (
    <label className="lang-switcher">
      <span className="lang-switcher__label">{ui.lang.label}</span>
      <select
        value={locale}
        aria-label={ui.lang.label}
        onChange={(event) => setLocale(event.target.value as Locale)}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
