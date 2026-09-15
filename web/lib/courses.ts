import fs from "fs";
import path from "path";

import { apiFetch } from "./api";
import type { CoursesPayload } from "./course-types";
import { getServerLocale } from "./i18n/locale";
import {
  localizeCourses,
  localizeTrack,
  type ResolvedCoursesPayload,
  type ResolvedTrack,
} from "./i18n/localize-course";

const DATA_PATH = path.join(process.cwd(), "..", "data", "courses.json");

function loadCoursesFromFile(): CoursesPayload {
  const fallback: CoursesPayload = { updated_at: "", tracks: [] };
  if (!fs.existsSync(DATA_PATH)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")) as CoursesPayload;
}

async function loadCoursesRaw(): Promise<CoursesPayload> {
  try {
    return await apiFetch<CoursesPayload>("/api/v1/courses", {
      next: { revalidate: 30 },
    });
  } catch {
    return loadCoursesFromFile();
  }
}

export async function loadCourses(): Promise<ResolvedCoursesPayload> {
  const locale = await getServerLocale();
  const raw = await loadCoursesRaw();
  return localizeCourses(raw, locale);
}

export async function getTrack(trackId: string): Promise<ResolvedTrack | undefined> {
  const locale = await getServerLocale();
  const raw = await loadCoursesRaw();
  const track = raw.tracks.find((item) => item.id === trackId);
  return track ? localizeTrack(track, locale) : undefined;
}

export async function getChapter(trackId: string, chapterId: string) {
  const track = await getTrack(trackId);
  if (!track) {
    return undefined;
  }
  const chapter = track.chapters.find((item) => item.id === chapterId);
  if (!chapter) {
    return undefined;
  }
  return { track, chapter };
}

export function freeChaptersCount(track: ResolvedTrack): number {
  return track.chapters.filter((chapter) => !chapter.is_premium).length;
}
