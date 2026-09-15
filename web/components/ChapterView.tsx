"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChapterIllustration } from "@/components/ChapterIllustration";
import { useLocale } from "@/components/LocaleProvider";
import type { ResolvedChapter, ResolvedSection, ResolvedTrack } from "@/lib/i18n/localize-course";
import {
  getChapterProgress,
  loadProgress,
  markChapterComplete,
  toggleChecklistItem,
  touchChapter,
  updateReadingProgress,
} from "@/lib/progress-storage";

type Props = {
  track: ResolvedTrack;
  chapter: ResolvedChapter;
  prevChapterId?: string;
  nextChapterId?: string;
};

function sectionKey(section: ResolvedSection, index: number) {
  return `${index}:${section.heading}`;
}

export function ChapterView({
  track,
  chapter,
  prevChapterId,
  nextChapterId,
}: Props) {
  const { ui } = useLocale();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [readPercent, setReadPercent] = useState(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [revealedMyths, setRevealedMyths] = useState<Record<string, boolean>>({});
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    touchChapter(track.id, chapter.id);
    const progress = loadProgress();
    const existing = getChapterProgress(progress, track.id, chapter.id);
    if (existing?.checklist) {
      setChecklist(existing.checklist);
    }
    if (existing?.readPercent) {
      setReadPercent(existing.readPercent);
    }
    if (existing?.completed) {
      setSaved(true);
    }
  }, [track.id, chapter.id]);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-section-key]");
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            const key = entry.target.getAttribute("data-section-key");
            if (!key) continue;
            if (entry.isIntersecting) {
              next.add(key);
              updateReadingProgress(
                track.id,
                chapter.id,
                Math.round((next.size / Math.max(nodes.length, 1)) * 85),
                key,
              );
            }
          }
          const percent = Math.round((next.size / Math.max(nodes.length, 1)) * 85);
          setReadPercent((p) => Math.max(p, percent));
          return next;
        });
      },
      { root: null, threshold: 0.45 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [track.id, chapter.id, chapter.sections]);

  const score = useMemo(() => {
    return chapter.quiz.questions.reduce((sum, question) => {
      return answers[question.id] === question.correct_index ? sum + 1 : sum;
    }, 0);
  }, [answers, chapter.quiz.questions]);

  const passed = score >= chapter.quiz.pass_score;
  const sectionsSeen = visibleSections.size;
  const sectionsTotal = chapter.sections.length;

  async function submitQuiz() {
    setSubmitted(true);
    if (passed) {
      await markChapterComplete(track.id, chapter.id, true, score);
      setReadPercent(100);
      setSaved(true);
    }
  }

  function onToggleCheck(itemKey: string, checked: boolean) {
    setChecklist((prev) => ({ ...prev, [itemKey]: checked }));
    toggleChecklistItem(track.id, chapter.id, itemKey, checked);
  }

  if (chapter.is_premium) {
    return (
      <div className="chapter-reader">
        <div className="premium-lock card">
          <p className="muted">Глава по подписке</p>
          <h2>{chapter.title}</h2>
          <p>{chapter.summary}</p>
          <p>
            Сейчас доступны бесплатные главы курса. Эта часть откроется в платной
            версии — мы добавим её позже.
          </p>
          <div className="chapter-nav">
            {prevChapterId ? (
              <Link href={`/courses/${track.id}/${prevChapterId}`}>← Назад</Link>
            ) : (
              <Link href={`/courses/${track.id}`}>← К списку глав</Link>
            )}
            {nextChapterId ? (
              <Link href={`/courses/${track.id}/${nextChapterId}`}>Далее →</Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-reader" ref={articleRef}>
      <div className="reading-progress" aria-label="Прогресс чтения">
        <div
          className="reading-progress__fill"
          style={{ width: `${readPercent}%`, background: track.color }}
        />
      </div>

      <header className="chapter-header animate-in">
        <div className="chapter-header__grid">
          <div>
            <p className="muted">
              {chapter.phase_label} · {chapter.duration_min} {ui.courses.minRead}
            </p>
            <h1>{chapter.title}</h1>
            <p>{chapter.summary}</p>
            <div className="chapter-meta">
              <span className="tag tag-green">
                Прочитано {sectionsSeen}/{sectionsTotal}
              </span>
              <span className="tag">{readPercent}% главы</span>
            </div>
          </div>
          <ChapterIllustration name={chapter.illustration} color={track.color} />
        </div>
      </header>

      <div className="chapter-sections">
        {chapter.sections.map((section, index) => {
          const key = sectionKey(section, index);
          const kind = section.kind ?? "text";
          const accent = section.accent ?? "info";
          return (
            <article
              className={`card section-card section-card--${kind} section-card--${accent} animate-in ${
                visibleSections.has(key) ? "section-card--seen" : ""
              }`}
              key={key}
              data-section-key={key}
              style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
            >
              <h2>{section.heading}</h2>

              {kind === "checklist" && section.items?.length ? (
                <ul className="interactive-checklist">
                  {section.items.map((item, itemIndex) => {
                    const itemKey = `${key}:${itemIndex}`;
                    const checked = Boolean(checklist[itemKey]);
                    return (
                      <li key={itemKey}>
                        <label className={`check-row ${checked ? "check-row--on" : ""}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => onToggleCheck(itemKey, event.target.checked)}
                          />
                          <span>{item}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {kind === "myth" ? (
                <div className="myth-block">
                  <p className="myth-block__myth">{section.myth}</p>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() =>
                      setRevealedMyths((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  >
                    {revealedMyths[key] ? "Скрыть факт" : "Показать факт"}
                  </button>
                  <p
                    className={`myth-block__fact ${
                      revealedMyths[key] ? "myth-block__fact--open" : ""
                    }`}
                  >
                    {section.fact ?? section.body}
                  </p>
                </div>
              ) : null}

              {kind !== "checklist" && kind !== "myth" ? (
                <p className={`section-body ${kind === "tip" ? "section-body--tip" : ""}`}>
                  {section.body}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <section className="card quiz-card animate-in" style={{ animationDelay: "200ms" }}>
        <h2>{ui.courses.quizTitle}</h2>
        <p className="muted">
          Нужно верных ответов: {chapter.quiz.pass_score} из {chapter.quiz.questions.length}
        </p>
        {chapter.quiz.questions.map((question, qIndex) => (
          <div className="quiz-question" key={question.id}>
            <p>
              <strong>{qIndex + 1}.</strong> {question.text}
            </p>
            <div className="quiz-options">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                const isCorrect = optionIndex === question.correct_index;
                const showState = submitted;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`quiz-option ${selected ? "quiz-option--selected" : ""} ${
                      showState && isCorrect ? "quiz-option--correct" : ""
                    } ${showState && selected && !isCorrect ? "quiz-option--wrong" : ""}`}
                    onClick={() =>
                      !submitted &&
                      setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!submitted ? (
          <button
            type="button"
            className="primary-btn"
            style={{ background: track.color }}
            disabled={Object.keys(answers).length < chapter.quiz.questions.length}
            onClick={submitQuiz}
          >
            {ui.courses.quizSubmit}
          </button>
        ) : (
          <div className="quiz-result">
            <p>
              {score}/{chapter.quiz.questions.length}
              {passed ? ` — ${ui.courses.quizPassed}` : ` — ${ui.courses.quizFailed}`}
            </p>
            {saved ? <p className="tag tag-green">{ui.courses.quizPassed}</p> : null}
            {!passed ? (
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                  setSaved(false);
                }}
              >
                Пройти заново
              </button>
            ) : null}
          </div>
        )}
      </section>

      <div className="chapter-nav">
        {prevChapterId ? (
          <Link href={`/courses/${track.id}/${prevChapterId}`}>{ui.courses.prev}</Link>
        ) : (
          <Link href={`/courses/${track.id}`}>{ui.courses.backToTrack}</Link>
        )}
        {(passed || saved) && nextChapterId ? (
          <Link href={`/courses/${track.id}/${nextChapterId}`}>{ui.courses.next}</Link>
        ) : null}
      </div>
    </div>
  );
}
