export const dynamic = "force-dynamic";

import { HospitalsView } from "@/components/HospitalsView";
import { PageIntro } from "@/components/PageIntro";
import { filterHospitals, loadHospitals } from "@/lib/hospitals";

type SearchParams = Promise<{
  city?: string;
  q?: string;
  paid?: string;
  free?: string;
}>;

const CITY_CENTERS: Record<string, [number, number]> = {
  almaty: [43.238949, 76.889709],
  astana: [51.169392, 71.449074],
  shymkent: [42.341737, 69.5901],
  karaganda: [49.8047, 73.1094],
};

export default async function HospitalsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const data = await loadHospitals();
  const cities = [...new Set(data.hospitals.map((item) => item.city_slug))].sort();
  const cityNames = Object.fromEntries(
    data.hospitals.map((item) => [item.city_slug, item.city_name]),
  );

  const hospitals = filterHospitals(
    data.hospitals,
    params.city,
    params.q,
    params.paid === "1",
    params.free === "1",
  );

  const center =
    (params.city && CITY_CENTERS[params.city]) || CITY_CENTERS.almaty;

  return (
    <main className="shell">
      <PageIntro
        eyebrow="4 города Казахстана"
        title="Роддома: карта, цены и отзывы"
        description="Выберите город, сравните условия и почитайте опыт других родителей."
      >
        <div className="stats">
          <span className="stat">Найдено: {hospitals.length}</span>
          <span className="stat">Всего в базе: {data.count}</span>
        </div>
      </PageIntro>

      <HospitalsView
        hospitals={hospitals}
        cities={cities}
        cityNames={cityNames}
        center={center}
        currentCity={params.city}
        currentQuery={params.q}
        paidOnly={params.paid === "1"}
        freeOnly={params.free === "1"}
        totalCount={data.count}
      />
    </main>
  );
}
