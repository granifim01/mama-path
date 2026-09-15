import { cookies } from "next/headers";

import { LOCALE_COOKIE } from "./constants";
import type { Locale } from "./types";
import { DEFAULT_LOCALE, LOCALES } from "./types";

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function parseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(LOCALE_COOKIE)?.value);
}
