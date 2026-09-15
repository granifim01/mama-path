import type { Locale, LocalizedString } from "./types";
import { DEFAULT_LOCALE } from "./types";

export function t(value: LocalizedString | undefined | null, locale: Locale): string {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return value[locale] ?? value[DEFAULT_LOCALE] ?? value.en ?? value.kk ?? "";
}

export function tArray(
  values: LocalizedString[] | string[] | undefined,
  locale: Locale,
): string[] {
  if (!values) {
    return [];
  }
  return values.map((item) => t(item, locale));
}
