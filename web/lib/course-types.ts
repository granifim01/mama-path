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

export type SectionKind =
  | "text"
  | "checklist"
  | "tip"
  | "myth"
  | "callout"
  | "steps"
  | "media";

export type SectionAccent = "info" | "warn" | "success" | "myth";

export type ChapterSection = {
  heading: LocalizedString;
  body: LocalizedString;
  kind?: SectionKind;
  accent?: SectionAccent;
  interactive?: boolean;
  items?: LocalizedString[];
  myth?: LocalizedString;
  fact?: LocalizedString;
  media?: {
    type: "gif" | "image" | "illustration";
    src: string;
    alt: LocalizedString;
    caption?: LocalizedString;
  };
};

export type ChapterIllustration =
  | "heartbeat"
  | "seed"
  | "bloom"
  | "bag"
  | "route"
  | "moon";

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
  illustration?: ChapterIllustration | string;
  reading_steps?: number;
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
  /** 0–100 reading progress inside the chapter */
  readPercent?: number;
  /** checklist item indexes marked done */
  checklist?: Record<string, boolean>;
  /** sections revealed / read */
  sectionsRead?: string[];
  startedAt?: string;
  lastVisitedAt?: string;
};

export type TrackProgress = {
  chapters: Record<string, ChapterProgress>;
};

export type AppProgress = {
  version: 2;
  tracks: Record<string, TrackProgress>;
};
