export const dynamic = "force-dynamic";

import { PageIntro } from "@/components/PageIntro";
import { loadProducts } from "@/lib/products";

const PHASE_LABEL: Record<string, string> = {
  "trimester-3": "3 триместр",
  infant: "Младенчество",
  planning: "Планирование",
  "trimester-1": "1 триместр",
  "trimester-2": "2 триместр",
};

export default async function ProductsPage() {
  const data = await loadProducts();
  const total = data.categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Подборки"
        title="Что купить к родам и первым месяцам"
        description={`${total} проверенных позиций с ориентирами по цене и отзывами родителей в Казахстане — по этапам беременности и возрасту малыша.`}
      />

      {data.categories.map((category) => (
        <section className="product-category" key={category.id}>
          <h2>{category.title}</h2>
          <div className="product-grid">
            {category.items.map((item, index) => (
              <article
                className="card product-card animate-in"
                key={item.id}
                style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
              >
                <div className="product-card__head">
                  <h3>{item.name}</h3>
                  <span className="badge">★ {item.rating}</span>
                </div>
                <p className="muted">{item.note}</p>
                <p className="price">{item.price_hint}</p>
                <span className="product-phase">
                  {PHASE_LABEL[item.phase] ?? item.phase}
                  {item.age_weeks ? ` · ${item.age_weeks} нед.` : ""}
                </span>
                <p className="product-reviews">
                  {item.reviews_count} отзывов родителей
                </p>
                <blockquote className="review">«{item.verified_review}»</blockquote>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
