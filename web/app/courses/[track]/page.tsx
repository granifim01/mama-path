import { notFound } from "next/navigation";

import { PageIntro } from "@/components/PageIntro";
import { TrackRoadmap } from "@/components/TrackRoadmap";
import { getTrack } from "@/lib/courses";

type Params = Promise<{ track: string }>;

export default async function TrackPage({ params }: { params: Params }) {
  const { track: trackId } = await params;
  const track = await getTrack(trackId);
  if (!track) {
    notFound();
  }

  return (
    <main className="shell">
      <PageIntro
        crumbs={[
          { href: "/courses", label: "Курсы" },
          { href: `/courses/${track.id}`, label: track.title },
        ]}
        title={track.title}
        description={track.subtitle}
      />
      <TrackRoadmap track={track} />
    </main>
  );
}
