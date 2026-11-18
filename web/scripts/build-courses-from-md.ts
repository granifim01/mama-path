/**
 * Builds data/courses.json chapter content from Markdown sources in
 * data/course-content/*.md.
 *
 * Source format (one file can hold several chapters):
 *
 *   # m-01
 *   summary: Короткое описание главы
 *
 *   ## Заголовок секции
 *   Абзац текста. **Жирный** поддерживается.
 *
 *   - пункт списка
 *   1. нумерованный пункт
 *
 *   ## [warning] Заголовок        ← kind: tip | warning | myth | check | story
 *   ...
 *
 *   ## Квиз
 *   ? Вопрос
 *   * правильный ответ
 *   - неправильный ответ
 *
 * Titles, phase labels and order stay as they are in courses.json.
 * Section bodies and quizzes are Russian-only for now; kk/en fall back to ru.
 */
import fs from "fs";
import path from "path";

type Section = { heading: string; body: string; kind?: string };
type Question = { id: string; text: string; options: string[]; correct_index: number };
type Parsed = { id: string; summary?: string; sections: Section[]; questions: Question[] };

const root = path.join(process.cwd(), "..", "data");
const srcDir = path.join(root, "course-content");
const coursesPath = path.join(root, "courses.json");

function parseFile(text: string): Parsed[] {
  const chapters: Parsed[] = [];
  let current: Parsed | null = null;
  let section: Section | null = null;
  let inQuiz = false;
  let question: Question | null = null;

  const flushSection = () => {
    if (current && section) {
      section.body = section.body.replace(/\n{3,}/g, "\n\n").trim();
      current.sections.push(section);
    }
    section = null;
  };
  const flushQuestion = () => {
    if (current && question) {
      if (question.correct_index < 0) throw new Error(`No correct answer in ${question.id}`);
      current.questions.push(question);
    }
    question = null;
  };

  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const chapterMatch = /^# ([mf]-\d{2})\s*$/.exec(line);
    if (chapterMatch) {
      flushSection();
      flushQuestion();
      if (current) chapters.push(current);
      current = { id: chapterMatch[1], sections: [], questions: [] };
      inQuiz = false;
      continue;
    }
    if (!current) continue;

    if (!section && !inQuiz && line.startsWith("summary:")) {
      current.summary = line.slice("summary:".length).trim();
      continue;
    }

    const headingMatch = /^## (?:\[(\w+)\]\s*)?(.+)$/.exec(line);
    if (headingMatch) {
      flushSection();
      flushQuestion();
      if (headingMatch[2].trim() === "Квиз") {
        inQuiz = true;
        continue;
      }
      inQuiz = false;
      section = { heading: headingMatch[2].trim(), body: "" };
      if (headingMatch[1]) section.kind = headingMatch[1];
      continue;
    }

    if (inQuiz) {
      if (line.startsWith("? ")) {
        flushQuestion();
        question = {
          id: `${current.id}-q${current.questions.length + 1}`,
          text: line.slice(2).trim(),
          options: [],
          correct_index: -1,
        };
      } else if (question && /^[*-] /.test(line)) {
        if (line.startsWith("* ")) question.correct_index = question.options.length;
        question.options.push(line.slice(2).trim());
      }
      continue;
    }

    if (section) section.body += `${line}\n`;
  }
  flushSection();
  flushQuestion();
  if (current) chapters.push(current);
  return chapters;
}

/** Deterministic shuffle so the correct answer isn't always first. */
function shuffleQuestion(q: Question): Question {
  let seed = [...q.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correct_index: order.indexOf(q.correct_index),
  };
}

function readingMinutes(sections: Section[]): number {
  const words = sections.map((s) => s.body).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 130));
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".md")).sort();
const parsed = new Map<string, Parsed>();
for (const file of files) {
  for (const chapter of parseFile(fs.readFileSync(path.join(srcDir, file), "utf-8"))) {
    if (parsed.has(chapter.id)) throw new Error(`Duplicate chapter ${chapter.id} in ${file}`);
    parsed.set(chapter.id, chapter);
  }
}

const courses = JSON.parse(fs.readFileSync(coursesPath, "utf-8"));
let updated = 0;
const missing: string[] = [];

for (const track of courses.tracks) {
  for (const chapter of track.chapters) {
    const src = parsed.get(chapter.id);
    if (!src) {
      missing.push(chapter.id);
      continue;
    }
    if (src.sections.length === 0 || src.questions.length === 0) {
      throw new Error(`Chapter ${chapter.id} needs sections and quiz questions`);
    }
    chapter.sections = src.sections;
    chapter.quiz = {
      pass_score: Math.max(1, Math.ceil(src.questions.length * 0.6)),
      questions: src.questions.map(shuffleQuestion),
    };
    chapter.duration_min = readingMinutes(src.sections);
    if (src.summary) {
      chapter.summary = typeof chapter.summary === "object"
        ? { ...chapter.summary, ru: src.summary }
        : src.summary;
    }
    updated += 1;
  }
}

courses.updated_at = new Date().toISOString();
fs.writeFileSync(coursesPath, `${JSON.stringify(courses, null, 2)}\n`);
console.log(`Updated ${updated} chapters from ${files.length} files.`);
if (missing.length) console.log(`Not in sources (left unchanged): ${missing.join(", ")}`);
