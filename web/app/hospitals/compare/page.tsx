import { HospitalCompare } from "@/components/HospitalCompare";
import { PageIntro } from "@/components/PageIntro";

type SearchParams = Promise<{ ids?: string }>;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const ids = (params.ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <main className="shell">
      <PageIntro
        crumbs={[
          { href: "/hospitals", label: "Роддома" },
          { href: "/hospitals/compare", label: "Сравнение" },
        ]}
        title="Сравнение роддомов"
        description="До трёх роддомов рядом — удобно выбрать, куда ехать. Добавляйте через кнопку «Сравнить» в списке."
      />
      <HospitalCompare ids={ids} />
    </main>
  );
}
