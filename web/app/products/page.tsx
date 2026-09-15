export const dynamic = "force-dynamic";

import { PageIntro } from "@/components/PageIntro";
import { loadProducts } from "@/lib/products";

export default async function ProductsPage() {
  const data = await loadProducts();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Подборки"
        title="Что купить к родам и первым месяцам"
        description="Список полезных вещей по этапу беременности и возрасту малыша — с отзывами других родителей."
      />

      {data.categories.map((category) => (
        <section className="product-category" key={category.id}>
          <h2>{category.title}</h2>
          <div className="product-grid">
            {category.items.map((item) => (
              <article className="card product-card" key={item.id}>
                <div className="product-card__head">
                  <h3>{item.name}</h3>
                  <span className="badge">★ {item.rating}</span>
                </div>
                <p className="muted">{item.note}</p>
                <p className="price">{item.price_hint}</p>
                <p className="product-reviews">
                  {item.reviews_count} отзывов родителей
                </p>
                <blockquote className="review animate-in">«{item.verified_review}»</blockquote>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
