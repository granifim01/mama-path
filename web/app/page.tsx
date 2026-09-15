export const dynamic = "force-dynamic";

import { HomeFeatures } from "@/components/HomeFeatures";
import { HomeIntro } from "@/components/HomeIntro";
import { loadCourses } from "@/lib/courses";
import { loadHospitals } from "@/lib/hospitals";
import { loadProducts } from "@/lib/products";

export default async function HomePage() {
  const [hospitals, courses, products] = await Promise.all([
    loadHospitals(),
    loadCourses(),
    loadProducts(),
  ]);

  const chaptersTotal = courses.tracks.reduce(
    (sum, track) => sum + track.chapters.length,
    0,
  );
  const productsTotal = products.categories.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );

  return (
    <main className="shell">
      <HomeIntro
        chaptersTotal={chaptersTotal}
        hospitalsCount={hospitals.count}
        productsTotal={productsTotal}
      />
      <HomeFeatures />
    </main>
  );
}
