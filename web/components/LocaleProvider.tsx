"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getUi, uiFormat } from "@/lib/i18n/ui";
import type { Locale } from "@/lib/i18n/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";
import { LOCALE_COOKIE } from "@/lib/i18n/constants";

type UiTree = ReturnType<typeof getUi>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  ui: UiTree;
  format: (template: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ?? DEFAULT_LOCALE,
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = next === "kk" ? "kk" : next;
    router.refresh();
  }, [router]);

  const value = useMemo<LocaleContextValue>(() => {
    const ui = getUi(locale);
    return {
      locale,
      setLocale,
      ui,
      format: (template, vars = {}) => uiFormat(template, vars),
    };
  }, [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
