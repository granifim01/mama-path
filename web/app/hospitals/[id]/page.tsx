import { HospitalDetail } from "@/components/HospitalDetail";
import { PageIntro } from "@/components/PageIntro";

type Params = Promise<{ id: string }>;

export default async function HospitalDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  return (
    <main className="shell">
      <PageIntro
        size="compact"
        crumbs={[
          { href: "/hospitals", label: "Роддома" },
          { href: `/hospitals/${id}`, label: "Подробнее" },
        ]}
      />
      <HospitalDetail hospitalId={decodeURIComponent(id)} />
    </main>
  );
}
