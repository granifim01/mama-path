"use client";

import Link from "next/link";

import { useLocale } from "@/components/LocaleProvider";

export function HomeFeatures() {
  const { ui } = useLocale();
  const f = ui.home.features;

  const FEATURES = [
    { href: "/courses", tone: "pink", icon: "📚", title: f.coursesTitle, text: f.coursesText },
    { href: "/tracker", tone: "violet", icon: "🗓", title: "Календарь беременности", text: "Неделя за неделей: размер малыша, самочувствие мамы и совет недели" },
    { href: "/hospitals", tone: "blue", icon: "🏥", title: f.hospitalsTitle, text: f.hospitalsText },
    { href: "/checklist", tone: "amber", icon: "🧳", title: "Сумка в роддом", text: "Интерактивный чек-лист: документы, вещи маме и малышу, выписка" },
    { href: "/products", tone: "green", icon: "🛍", title: f.productsTitle, text: f.productsText },
    { href: "/help", tone: "red", icon: "🆘", title: f.helpTitle, text: f.helpText },
  ];

  return (
    <section className="home-section">
      <div className="section-head">
        <p className="page-intro__eyebrow">Разделы</p>
        <h2>Чем поможет Mama Path</h2>
      </div>
      <div className="feature-grid feature-grid--3">
        {FEATURES.map((feature) => (
          <Link key={feature.href} href={feature.href} className={`feature-card card tone-${feature.tone}`}>
            <span className="feature-card__icon" aria-hidden>{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p className="muted">{feature.text}</p>
            <span className="feature-card__more">Открыть →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
