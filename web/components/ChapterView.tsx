"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useLocale } from "@/components/LocaleProvider";
import type { ResolvedChapter, ResolvedTrack } from "@/lib/i18n/localize-course";
import { markChapterComplete } from "@/lib/progress-storage";

type Props = {
  track: ResolvedTrack;
  chapter: ResolvedChapter;
  prevChapterId?: string;
  nextChapterId?: string;
};

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

  const score = useMemo(() => {
    return chapter.quiz.questions.reduce((sum, question) => {
      return answers[question.id] === question.correct_index ? sum + 1 : sum;
    }, 0);
  }, [answers, chapter.quiz.questions]);

  const passed = score >= chapter.quiz.pass_score;

  async function submitQuiz() {
    setSubmitted(true);
    if (passed) {
      await markChapterComplete(track.id, chapter.id, true, score);
      setSaved(true);
    }
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
    <div className="chapter-reader">
      <header className="chapter-header animate-in">
        <p className="muted">
          {chapter.phase_label} · {chapter.duration_min} {ui.courses.minRead}
        </p>
        <h1>{chapter.title}</h1>
        <p>{chapter.summary}</p>
      </header>

      <div className="chapter-sections">
        {chapter.sections.map((section, index) => (
          <article
            className="card section-card animate-in"
            key={section.heading}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </div>

      <section className="card quiz-card animate-in" style={{ animationDelay: "200ms" }}>
        <h2>{ui.courses.quizTitle}</h2>
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
        {passed && nextChapterId ? (
          <Link href={`/courses/${track.id}/${nextChapterId}`}>{ui.courses.next}</Link>
        ) : null}
      </div>
    </div>
  );
}
