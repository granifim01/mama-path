"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ResolvedTrack } from "@/lib/i18n/localize-course";
import {
  getChapterProgress,
  loadProgress,
  syncProgressFromApi,
  trackStats,
} from "@/lib/progress-storage";

type Props = {
  track: ResolvedTrack;
};

export function TrackRoadmap({ track }: Props) {
  const [stats, setStats] = useState({
    done: 0,
    started: 0,
    total: track.chapters.length,
    percent: 0,
    completedPercent: 0,
  });
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [partial, setPartial] = useState<Record<string, number>>({});

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
      const reads: Record<string, number> = {};
      for (const chapter of track.chapters) {
        const item = getChapterProgress(progress, track.id, chapter.id);
        if (item && !item.completed) {
          reads[chapter.id] = item.readPercent ?? 0;
        }
      }
      setPartial(reads);
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
        <div className="progress-panel__head">
          <div>
            <p className="muted">Гибкий прогресс</p>
            <p className="progress-panel__title">
              {stats.done} завершено · {stats.started} в процессе · {stats.total} всего
            </p>
          </div>
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(${track.color} ${stats.percent}%, #efe6df 0)`,
            }}
            aria-label={`Общий прогресс ${stats.percent}%`}
          >
            <span>{stats.percent}%</span>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${stats.percent}%`, background: track.color }}
          />
        </div>
        <p className="muted">
          Учитывается чтение разделов, чек-листы и пройденные тесты — можно возвращаться в любой момент.
        </p>
      </div>

      <div className="chapter-list">
        {track.chapters.map((chapter, index) => {
          const done = completedIds.has(chapter.id);
          const read = partial[chapter.id] ?? 0;
          const inProgress = !done && read > 0;
          return (
            <Link
              key={chapter.id}
              href={`/courses/${track.id}/${chapter.id}`}
              className={`chapter-card animate-in ${done ? "chapter-card--done" : ""} ${
                inProgress ? "chapter-card--progress" : ""
              }`}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="chapter-card__top">
                <span className="chapter-order" style={{ background: track.color }}>
                  {done ? "✓" : index + 1}
                </span>
                <div>
                  <p className="chapter-phase">{chapter.phase_label}</p>
                  <h3>{chapter.title}</h3>
                  <p className="muted">{chapter.summary}</p>
                </div>
              </div>
              {inProgress ? (
                <div className="mini-progress">
                  <div
                    className="mini-progress__fill"
                    style={{ width: `${read}%`, background: track.color }}
                  />
                </div>
              ) : null}
              <div className="chapter-meta">
                <span>{chapter.duration_min} мин чтения</span>
                {chapter.is_premium ? (
                  <span className="tag tag-blue">По подписке</span>
                ) : (
                  <span className="tag tag-green">Бесплатно</span>
                )}
                {done ? <span className="tag tag-green">Пройдено</span> : null}
                {inProgress ? <span className="tag tag-blue">Читаю · {read}%</span> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
