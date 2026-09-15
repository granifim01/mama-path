"use client";

import { apiFetch } from "./api";
import type { AppProgress, ChapterProgress } from "./course-types";
import { getToken } from "./auth-storage";

const STORAGE_KEY = "mama-path-progress-v1";

export function loadProgress(): AppProgress {
  if (typeof window === "undefined") {
    return emptyProgress();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyProgress();
    }
    return JSON.parse(raw) as AppProgress;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: AppProgress): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export async function syncProgressFromApi(): Promise<AppProgress> {
  const token = getToken();
  if (!token) {
    return loadProgress();
  }

  try {
    const remote = await apiFetch<{
      tracks: Record<
        string,
        Record<
          string,
          {
            completed: boolean;
            quiz_passed: boolean;
            score: number;
          }
        >
      >;
    }>("/api/v1/progress", { token });

    const progress = emptyProgress();
    for (const [trackId, chapters] of Object.entries(remote.tracks)) {
      progress.tracks[trackId] = { chapters: {} };
      for (const [chapterId, item] of Object.entries(chapters)) {
        progress.tracks[trackId].chapters[chapterId] = {
          completed: item.completed,
          quizPassed: item.quiz_passed,
          score: item.score,
        };
      }
    }
    saveProgress(progress);
    return progress;
  } catch {
    return loadProgress();
  }
}

export function getChapterProgress(
  progress: AppProgress,
  trackId: string,
  chapterId: string,
): ChapterProgress | undefined {
  return progress.tracks[trackId]?.chapters[chapterId];
}

export async function markChapterComplete(
  trackId: string,
  chapterId: string,
  quizPassed: boolean,
  score: number,
): Promise<AppProgress> {
  const progress = loadProgress();
  if (!progress.tracks[trackId]) {
    progress.tracks[trackId] = { chapters: {} };
  }
  progress.tracks[trackId].chapters[chapterId] = {
    completed: true,
    quizPassed,
    score,
    completedAt: new Date().toISOString(),
  };
  saveProgress(progress);

  const token = getToken();
  if (token) {
    try {
      await apiFetch(`/api/v1/progress/${trackId}/${chapterId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          completed: true,
          quiz_passed: quizPassed,
          score,
        }),
      });
    } catch {
      // local fallback already saved
    }
  }

  return progress;
}

export function trackStats(
  progress: AppProgress,
  trackId: string,
  chapterIds: string[],
) {
  const done = chapterIds.filter(
    (id) => progress.tracks[trackId]?.chapters[id]?.completed,
  ).length;
  const percent = chapterIds.length
    ? Math.round((done / chapterIds.length) * 100)
    : 0;
  return { done, total: chapterIds.length, percent };
}

function emptyProgress(): AppProgress {
  return { version: 1, tracks: {} };
}
