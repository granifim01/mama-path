"use client";

import { useMemo, useState } from "react";

import type { ProductCategory } from "@/lib/products";

const PHASES: { id: string; label: string }[] = [
  { id: "all", label: "Любой этап" },
  { id: "trimester-1", label: "1 триместр" },
  { id: "trimester-2", label: "2 триместр" },
  { id: "trimester-3", label: "3 триместр" },
  { id: "infant", label: "После родов" },
];

const PHASE_LABEL: Record<string, string> = {
  "trimester-1": "с 1 триместра",
  "trimester-2": "со 2 триместра",
  "trimester-3": "к 3 триместру",
  infant: "после родов",
};

function ageLabel(range: string | null): string | null {
  if (!range) return null;
  const [from, to] = range.split("-").map(Number);
  const fmt = (w: number) => (w < 12 ? `${w} нед.` : w < 104 ? `${Math.round(w / 4.345)} мес.` : `${Math.round(w / 52)} г.`);
  return from === 0 ? `0 – ${fmt(to)}` : `${fmt(from)} – ${fmt(to)}`;
}

export function ProductsCatalog({ categories }: { categories: ProductCategory[] }) {
  const [active, setActive] = useState("all");
  const [phase, setPhase] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter((c) => active === "all" || c.id === active)
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (item) =>
            (phase === "all" || item.phase === phase) &&
            (!q || `${item.name} ${item.note}`.toLowerCase().includes(q)),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, active, phase, search]);

  const total = filtered.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="catalog">
      <div className="catalog-toolbar card">
        <div className="chip-row" role="tablist" aria-label="Категории">
          <button type="button" className={`chip ${active === "all" ? "is-active" : ""}`} onClick={() => setActive("all")}>
            Все
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" className={`chip ${active === c.id ? "is-active" : ""}`} onClick={() => setActive(c.id)}>
              {c.icon ? <span aria-hidden>{c.icon}</span> : null} {c.title}
            </button>
          ))}
        </div>
        <div className="catalog-toolbar__row">
          <input type="search" placeholder="Поиск: коляска, крем, бутылочка…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Поиск по товарам" />
          <select value={phase} onChange={(e) => setPhase(e.target.value)} aria-label="Этап">
            {PHASES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <p className="muted small">Найдено: {total}</p>
      </div>

      {filtered.map((category) => (
        <section className="product-category" key={category.id}>
          <div className="product-category__head">
            <h2>
              {category.icon ? <span aria-hidden>{category.icon}</span> : null} {category.title}
            </h2>
            {category.description ? <p className="muted">{category.description}</p> : null}
          </div>
          <div className="product-grid">
            {category.items.map((item) => {
              const age = ageLabel(item.age_weeks);
              return (
                <article className="card product-card" key={item.id}>
                  <div className="product-card__head">
                    <h3>{item.name}</h3>
                    <span className="rating" title={`${item.reviews_count} отзывов`}>★ {item.rating.toFixed(1)}</span>
                  </div>
                  <div className="tags">
                    {PHASE_LABEL[item.phase] ? <span className="tag tag-blue">{PHASE_LABEL[item.phase]}</span> : null}
                    {age ? <span className="tag tag-green">{age}</span> : null}
                  </div>
                  <p className="product-card__note">{item.note}</p>
                  <blockquote className="review">«{item.verified_review}»</blockquote>
                  <div className="product-card__foot">
                    <span className="price">{item.price_hint}</span>
                    <span className="product-reviews">{item.reviews_count} отзывов</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <p>Ничего не нашлось. Попробуйте другой запрос или этап.</p>
        </div>
      ) : null}
    </div>
  );
}
