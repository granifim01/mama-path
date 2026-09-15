"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ResolvedTrack } from "@/lib/i18n/localize-course";
import { loadProgress, syncProgressFromApi, trackStats } from "@/lib/progress-storage";

type Props = {
  track: ResolvedTrack;
};

export function TrackRoadmap({ track }: Props) {
  const [stats, setStats] = useState({ done: 0, total: track.chapters.length, percent: 0 });
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    function applyProgress(progress: Awaited<ReturnType<typeof syncProgressFromApi>>) {
      const nextStats = trackStats(
        progress,
        track.id,
        track.chapters.map((chapter) => chapter.id),
      );
      setStats(nextStats);
      setCompletedIds(
        new Set(
          track.chapters
            .filter((chapter) => progress.tracks[track.id]?.chapters[chapter.id]?.completed)
            .map((chapter) => chapter.id),
        ),
      );
    }

    applyProgress(loadProgress());

    syncProgressFromApi()
      .then(applyProgress)
      .catch(() => {
        // keep local progress
      });
  }, [track]);

  return (
    <div className="course-layout">
      <div className="progress-panel">
        <p className="muted">Ваш прогресс</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${stats.percent}%`, background: track.color }}
          />
        </div>
        <p>
          Пройдено {stats.done} из {stats.total} глав ({stats.percent}%)
        </p>
      </div>

      <div className="chapter-list">
        {track.chapters.map((chapter, index) => {
          const done = completedIds.has(chapter.id);
          return (
            <Link
              key={chapter.id}
              href={`/courses/${track.id}/${chapter.id}`}
              className={`chapter-card animate-in ${done ? "chapter-card--done" : ""}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="chapter-card__top">
                <span className="chapter-order" style={{ background: track.color }}>
                  {index + 1}
                </span>
                <div>
                  <p className="chapter-phase">{chapter.phase_label}</p>
                  <h3>{chapter.title}</h3>
                  <p className="muted">{chapter.summary}</p>
                </div>
              </div>
              <div className="chapter-meta">
                <span>{chapter.duration_min} мин чтения</span>
                {chapter.is_premium ? (
                  <span className="tag tag-blue">По подписке</span>
                ) : (
                  <span className="tag tag-green">Бесплатно</span>
                )}
                {done ? <span className="tag tag-green">Пройдено</span> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
