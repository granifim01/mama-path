import { notFound } from "next/navigation";

import { ChapterView } from "@/components/ChapterView";
import { PageIntro } from "@/components/PageIntro";
import { getChapter } from "@/lib/courses";

type Params = Promise<{ track: string; chapter: string }>;

export default async function ChapterPage({ params }: { params: Params }) {
  const { track: trackId, chapter: chapterId } = await params;
  const result = await getChapter(trackId, chapterId);
  if (!result) {
    notFound();
  }

  const { track, chapter } = result;
  const sorted = [...track.chapters].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((item) => item.id === chapter.id);
  const prevChapterId = index > 0 ? sorted[index - 1].id : undefined;
  const nextChapterId =
    index < sorted.length - 1 ? sorted[index + 1].id : undefined;

  return (
    <main className="shell">
      <PageIntro
        size="compact"
        crumbs={[
          { href: "/courses", label: "Курсы" },
          { href: `/courses/${track.id}`, label: track.title },
          { href: `/courses/${track.id}/${chapter.id}`, label: chapter.title },
        ]}
      />
      <ChapterView
        track={track}
        chapter={chapter}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
      />
    </main>
  );
}
