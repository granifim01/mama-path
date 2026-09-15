"use client";

import { apiFetch } from "./api";
import type { AppProgress, ChapterProgress } from "./course-types";
import { getToken } from "./auth-storage";

const STORAGE_KEY = "mama-path-progress-v2";
const LEGACY_KEY = "mama-path-progress-v1";

export function loadProgress(): AppProgress {
  if (typeof window === "undefined") {
    return emptyProgress();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppProgress;
      return { ...emptyProgress(), ...parsed, version: 2 };
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as AppProgress;
      const migrated: AppProgress = { ...parsed, version: 2 };
      saveProgress(migrated);
      return migrated;
    }
    return emptyProgress();
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

    const local = loadProgress();
    const progress = emptyProgress();
    for (const [trackId, chapters] of Object.entries(remote.tracks)) {
      progress.tracks[trackId] = { chapters: {} };
      for (const [chapterId, item] of Object.entries(chapters)) {
        const localChapter = local.tracks[trackId]?.chapters[chapterId];
        progress.tracks[trackId].chapters[chapterId] = {
          completed: item.completed,
          quizPassed: item.quiz_passed,
          score: item.score,
          readPercent: localChapter?.readPercent,
          checklist: localChapter?.checklist,
          sectionsRead: localChapter?.sectionsRead,
          startedAt: localChapter?.startedAt,
          lastVisitedAt: localChapter?.lastVisitedAt,
          completedAt: localChapter?.completedAt,
        };
      }
    }
    // keep purely-local partial progress for chapters not yet on server
    for (const [trackId, track] of Object.entries(local.tracks)) {
      if (!progress.tracks[trackId]) {
        progress.tracks[trackId] = { chapters: {} };
      }
      for (const [chapterId, chapter] of Object.entries(track.chapters)) {
        if (!progress.tracks[trackId].chapters[chapterId]) {
          progress.tracks[trackId].chapters[chapterId] = chapter;
        }
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

function ensureChapter(
  progress: AppProgress,
  trackId: string,
  chapterId: string,
): ChapterProgress {
  if (!progress.tracks[trackId]) {
    progress.tracks[trackId] = { chapters: {} };
  }
  if (!progress.tracks[trackId].chapters[chapterId]) {
    progress.tracks[trackId].chapters[chapterId] = {
      completed: false,
      quizPassed: false,
      score: 0,
      readPercent: 0,
      checklist: {},
      sectionsRead: [],
      startedAt: new Date().toISOString(),
    };
  }
  const chapter = progress.tracks[trackId].chapters[chapterId];
  chapter.lastVisitedAt = new Date().toISOString();
  if (!chapter.startedAt) {
    chapter.startedAt = chapter.lastVisitedAt;
  }
  return chapter;
}

export function touchChapter(trackId: string, chapterId: string): AppProgress {
  const progress = loadProgress();
  ensureChapter(progress, trackId, chapterId);
  saveProgress(progress);
  return progress;
}

export function updateReadingProgress(
  trackId: string,
  chapterId: string,
  readPercent: number,
  sectionKey?: string,
): AppProgress {
  const progress = loadProgress();
  const chapter = ensureChapter(progress, trackId, chapterId);
  chapter.readPercent = Math.max(chapter.readPercent ?? 0, Math.min(100, Math.round(readPercent)));
  if (sectionKey) {
    const set = new Set(chapter.sectionsRead ?? []);
    set.add(sectionKey);
    chapter.sectionsRead = [...set];
  }
  saveProgress(progress);
  return progress;
}

export function toggleChecklistItem(
  trackId: string,
  chapterId: string,
  itemKey: string,
  checked: boolean,
): AppProgress {
  const progress = loadProgress();
  const chapter = ensureChapter(progress, trackId, chapterId);
  chapter.checklist = { ...(chapter.checklist ?? {}), [itemKey]: checked };
  saveProgress(progress);
  return progress;
}

export async function markChapterComplete(
  trackId: string,
  chapterId: string,
  quizPassed: boolean,
  score: number,
): Promise<AppProgress> {
  const progress = loadProgress();
  const chapter = ensureChapter(progress, trackId, chapterId);
  chapter.completed = true;
  chapter.quizPassed = quizPassed;
  chapter.score = score;
  chapter.readPercent = 100;
  chapter.completedAt = new Date().toISOString();
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
  const chapters = progress.tracks[trackId]?.chapters ?? {};
  const done = chapterIds.filter((id) => chapters[id]?.completed).length;
  const started = chapterIds.filter((id) => {
    const item = chapters[id];
    return Boolean(item && !item.completed && ((item.readPercent ?? 0) > 0 || item.startedAt));
  }).length;
  const readSum = chapterIds.reduce((sum, id) => {
    const item = chapters[id];
    if (!item) return sum;
    if (item.completed) return sum + 100;
    return sum + (item.readPercent ?? 0);
  }, 0);
  const percent = chapterIds.length
    ? Math.round(readSum / chapterIds.length)
    : 0;
  const completedPercent = chapterIds.length
    ? Math.round((done / chapterIds.length) * 100)
    : 0;
  return {
    done,
    started,
    total: chapterIds.length,
    percent,
    completedPercent,
  };
}

function emptyProgress(): AppProgress {
  return { version: 2, tracks: {} };
}
