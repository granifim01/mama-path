export const dynamic = "force-dynamic";

import Link from "next/link";

import { PageIntro } from "@/components/PageIntro";
import { ProductsCatalog } from "@/components/ProductsCatalog";
import { loadProducts } from "@/lib/products";

export default async function ProductsPage() {
  const data = await loadProducts();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Подборки"
        title="Что купить к родам и первым месяцам"
        description="Проверенный список по этапам беременности и возрасту малыша — с советами и опытом других родителей. Мы ничего не продаём: цены ориентировочные по Казахстану."
      >
        <div className="intro-actions">
          <Link href="/checklist" className="btn-secondary">🧳 Чек-лист сумки в роддом</Link>
        </div>
      </PageIntro>
      <ProductsCatalog categories={data.categories} />
    </main>
  );
}
