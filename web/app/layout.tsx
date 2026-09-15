import type { Metadata } from "next";
import { Onest } from "next/font/google";

import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getServerLocale } from "@/lib/i18n/locale";

import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mama Path — всё для будущих родителей",
  description:
    "Курсы для мамы и папы, карта роддомов, подбор товаров и помощь в срочных ситуациях в Казахстане",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale === "kk" ? "kk" : locale}
      className={onest.variable}
    >
      <body className={onest.className}>
        <LocaleProvider initialLocale={locale}>
          <SiteHeader />
          <div className="page-body">{children}</div>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
