"use client";

import Link from "next/link";

import { useLocale } from "@/components/LocaleProvider";
import { WeekWidget } from "@/components/WeekWidget";

type Props = {
  chaptersTotal: number;
  hospitalsCount: number;
  productsTotal: number;
};

export function HomeIntro({ chaptersTotal, hospitalsCount, productsTotal }: Props) {
  const { ui, format } = useLocale();

  return (
    <section className="home-hero">
      <div className="home-hero__text">
        <p className="page-intro__eyebrow">{ui.home.eyebrow}</p>
        <h1 className="home-hero__title">{ui.home.title}</h1>
        <p className="page-intro__desc">{ui.home.description}</p>
        <div className="home-hero__cta">
          <Link href="/courses" className="btn-primary btn-lg">
            {ui.nav.courses} →
          </Link>
          <Link href="/tracker" className="btn-secondary btn-lg">
            🗓 {ui.nav.tracker}
          </Link>
        </div>
        <div className="stats">
          <span className="stat">📚 {format(ui.home.statsChapters, { n: chaptersTotal })}</span>
          <span className="stat">🏥 {format(ui.home.statsHospitals, { n: hospitalsCount })}</span>
          <span className="stat">🛍 {format(ui.home.statsProducts, { n: productsTotal })}</span>
        </div>
      </div>
      <WeekWidget />
    </section>
  );
}
