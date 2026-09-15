"use client";

import Link from "next/link";

import { useLocale } from "@/components/LocaleProvider";

const FEATURE_META = [
  { href: "/courses", color: "#d4567f", icon: "📚", key: "courses" as const },
  { href: "/hospitals", color: "#2b6dad", icon: "🏥", key: "hospitals" as const },
  { href: "/products", color: "#2a8a57", icon: "🛍", key: "products" as const },
  { href: "/help", color: "#c62828", icon: "🆘", key: "help" as const },
  { href: "/register", color: "#b38b59", icon: "✨", key: "account" as const },
];

export function HomeFeatures() {
  const { ui } = useLocale();
  const f = ui.home.features;

  const titles: Record<(typeof FEATURE_META)[number]["key"], string> = {
    courses: f.coursesTitle,
    hospitals: f.hospitalsTitle,
    products: f.productsTitle,
    help: f.helpTitle,
    account: f.accountTitle,
  };

  const texts: Record<(typeof FEATURE_META)[number]["key"], string> = {
    courses: f.coursesText,
    hospitals: f.hospitalsText,
    products: f.productsText,
    help: f.helpText,
    account: f.accountText,
  };

  return (
    <section className="feature-grid">
      {FEATURE_META.map((feature, index) => (
        <Link
          key={feature.href}
          href={feature.href}
          className="feature-card card"
          style={{
            borderTop: `4px solid ${feature.color}`,
            animationDelay: `${index * 70}ms`,
          }}
        >
          <span className="feature-card__icon" aria-hidden>
            {feature.icon}
          </span>
          <h2>{titles[feature.key]}</h2>
          <p className="muted">{texts[feature.key]}</p>
        </Link>
      ))}
    </section>
  );
}
