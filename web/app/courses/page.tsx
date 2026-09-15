export const dynamic = "force-dynamic";

import Link from "next/link";

import { PageIntro } from "@/components/PageIntro";
import { freeChaptersCount, loadCourses } from "@/lib/courses";

export default async function CoursesPage() {
  const data = await loadCourses();
  const chaptersTotal = data.tracks.reduce(
    (sum, track) => sum + track.chapters.length,
    0,
  );

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Обучение"
        title="Курсы для мамы и папы"
        description={`Полные курсы — от планирования до первых месяцев с малышом. ${chaptersTotal} глав, короткие тесты и сохранение прогресса.`}
      />

      <section className="track-grid">
        {data.tracks.map((track) => (
          <Link
            key={track.id}
            href={`/courses/${track.id}`}
            className="track-card card"
            style={{ borderTop: `4px solid ${track.color}` }}
          >
            <h2>{track.title}</h2>
            <p className="muted">{track.subtitle}</p>
            <div className="chapter-meta">
              <span>{track.chapters.length} глав</span>
              <span className="tag tag-green">
                {freeChaptersCount(track)} бесплатно
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
