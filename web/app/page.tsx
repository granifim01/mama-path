export const dynamic = "force-dynamic";

import Link from "next/link";

import { HomeFeatures } from "@/components/HomeFeatures";
import { HomeIntro } from "@/components/HomeIntro";
import { HomeJourney } from "@/components/HomeJourney";
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
    <main className="shell shell--home">
      <HomeIntro
        chaptersTotal={chaptersTotal}
        hospitalsCount={hospitals.count}
        productsTotal={productsTotal}
      />
      <HomeFeatures />
      <HomeJourney />
      <section className="sos-banner">
        <div>
          <h2>Что-то тревожит прямо сейчас?</h2>
          <p>Опишите симптомы — подскажем, звонить ли 103, ехать в роддом или можно подождать до приёма.</p>
        </div>
        <div className="sos-banner__actions">
          <Link href="/help" className="btn-light">Проверить симптомы</Link>
          <a href="tel:103" className="btn-outline-light">📞 103</a>
        </div>
      </section>
    </main>
  );
}
