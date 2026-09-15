import type { Locale } from "./types";

import en from "./ui/en.json";
import kk from "./ui/kk.json";
import ru from "./ui/ru.json";

const UI = { ru, kk, en } as const;

type UiTree = typeof ru;

export function getUi(locale: Locale): UiTree {
  return UI[locale] ?? UI.ru;
}

export function uiFormat(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}
