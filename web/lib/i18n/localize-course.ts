import type {
  Chapter,
  ChapterQuiz,
  ChapterSection,
  CoursesPayload,
  QuizQuestion,
  Track,
} from "@/lib/course-types";

import { t, tArray } from "./t";
import type { Locale, LocalizedString } from "./types";

function locStr(value: LocalizedString, locale: Locale): string {
  return t(value, locale);
}

export type ResolvedSection = { heading: string; body: string; kind?: ChapterSection["kind"] };
export type ResolvedQuestion = {
  id: string;
  text: string;
  options: string[];
  correct_index: number;
};
export type ResolvedQuiz = {
  pass_score: number;
  questions: ResolvedQuestion[];
};
export type ResolvedChapter = Omit<
  Chapter,
  "title" | "phase_label" | "summary" | "sections" | "quiz"
> & {
  title: string;
  phase_label: string;
  summary: string;
  sections: ResolvedSection[];
  quiz: ResolvedQuiz;
};
export type ResolvedTrack = Omit<Track, "title" | "subtitle" | "chapters"> & {
  title: string;
  subtitle: string;
  chapters: ResolvedChapter[];
};
export type ResolvedCoursesPayload = Omit<CoursesPayload, "tracks"> & {
  tracks: ResolvedTrack[];
};

export function localizeSection(
  section: ChapterSection,
  locale: Locale,
): ResolvedSection {
  return {
    heading: locStr(section.heading, locale),
    body: locStr(section.body, locale),
    ...(section.kind ? { kind: section.kind } : {}),
  };
}

export function localizeQuestion(
  question: QuizQuestion,
  locale: Locale,
): ResolvedQuestion {
  return {
    ...question,
    text: locStr(question.text, locale),
    options: tArray(question.options, locale),
  };
}

export function localizeQuiz(quiz: ChapterQuiz, locale: Locale): ResolvedQuiz {
  return {
    ...quiz,
    questions: quiz.questions.map((q) => localizeQuestion(q, locale)),
  };
}

export function localizeChapter(
  chapter: Chapter,
  locale: Locale,
): ResolvedChapter {
  return {
    ...chapter,
    title: locStr(chapter.title, locale),
    phase_label: locStr(chapter.phase_label, locale),
    summary: locStr(chapter.summary, locale),
    sections: chapter.sections.map((s) => localizeSection(s, locale)),
    quiz: localizeQuiz(chapter.quiz, locale),
  };
}

export function localizeTrack(track: Track, locale: Locale): ResolvedTrack {
  return {
    ...track,
    title: locStr(track.title, locale),
    subtitle: locStr(track.subtitle, locale),
    chapters: track.chapters.map((c) => localizeChapter(c, locale)),
  };
}

export function localizeCourses(
  payload: CoursesPayload,
  locale: Locale,
): ResolvedCoursesPayload {
  return {
    ...payload,
    tracks: payload.tracks.map((track) => localizeTrack(track, locale)),
  };
}
