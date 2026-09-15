import type { LocalizedString } from "@/lib/i18n/types";

export type QuizQuestion = {
  id: string;
  text: LocalizedString;
  options: LocalizedString[];
  correct_index: number;
};

export type ChapterQuiz = {
  pass_score: number;
  questions: QuizQuestion[];
};

export type ChapterSection = {
  heading: LocalizedString;
  body: LocalizedString;
};

export type Chapter = {
  id: string;
  order: number;
  phase: string;
  phase_label: LocalizedString;
  title: LocalizedString;
  duration_min: number;
  is_premium: boolean;
  summary: LocalizedString;
  sections: ChapterSection[];
  quiz: ChapterQuiz;
};

export type Track = {
  id: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  color: string;
  chapters: Chapter[];
};

export type CoursesPayload = {
  updated_at: string;
  tracks: Track[];
};

export type ChapterProgress = {
  completed: boolean;
  quizPassed: boolean;
  score: number;
  completedAt?: string;
};

export type TrackProgress = {
  chapters: Record<string, ChapterProgress>;
};

export type AppProgress = {
  version: 1;
  tracks: Record<string, TrackProgress>;
};
