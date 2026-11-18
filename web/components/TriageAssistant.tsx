"use client";

import Link from "next/link";
import { useState } from "react";

import { levelLabel, triageQuery, type TriageResult } from "@/lib/triage";

const EXAMPLES = [
  "Отошли воды, что делать?",
  "Ребёнку месяц, температура 38.2",
  "Мало шевелений на 36 неделе",
  "Болит голова и мушки перед глазами",
  "Малыш плачет по вечерам часами",
  "Трещины сосков, больно кормить",
  "Что можно есть при беременности?",
];

const LEVEL_ICON: Record<TriageResult["level"], string> = {
  emergency: "🚨",
  urgent: "⚠️",
  doctor: "🩺",
  observe: "ℹ️",
};

export function TriageAssistant() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);

  function analyze(text?: string) {
    const value = (text ?? query).trim();
    if (!value) {
      return;
    }
    setQuery(value);
    setResult(triageQuery(value));
  }

  return (
    <div className="triage-layout">
      <div className="card">
        <h2>Опишите, что случилось</h2>
        <p className="muted">
          При угрозе жизни не ждите ответа — сразу звоните <a href="tel:103">103</a>.
        </p>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze();
          }}
          rows={4}
          placeholder="Например: ребёнку 2 недели, температура 38.5, плохо сосёт"
        />
        <div className="triage-actions">
          <button type="button" className="btn-primary" onClick={() => analyze()}>
            Получить совет
          </button>
          <a className="btn-danger" href="tel:103">
            📞 Позвонить 103
          </a>
        </div>
        <div className="triage-chips">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="triage-chip" onClick={() => analyze(example)}>
              {example}
            </button>
          ))}
        </div>
      </div>

      {result ? (
        <div className={`card triage-result triage-${result.level}`} key={result.title + query} aria-live="polite">
          <p className="triage-level">
            <span aria-hidden>{LEVEL_ICON[result.level]}</span> {levelLabel(result.level)}
          </p>
          <h3>{result.title}</h3>
          <p>{result.advice}</p>
          <p className="triage-action">
            <strong>Что делать:</strong> {result.action}
          </p>
          {result.steps?.length ? (
            <ol className="triage-steps">
              {result.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          ) : null}
          <div className="triage-actions">
            {result.level === "emergency" || result.level === "urgent" ? (
              <a className="btn-danger" href="tel:103">📞 103</a>
            ) : null}
            {result.link ? (
              <Link href={result.link.href} className="btn-secondary">{result.link.label} →</Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
