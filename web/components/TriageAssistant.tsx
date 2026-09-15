"use client";

import { useState } from "react";

import { levelLabel, triageQuery } from "@/lib/triage";

const EXAMPLES = [
  "Отошли воды, что делать?",
  "Ребёнку месяц, температура 38.2",
  "Мало шевелений на 36 неделе",
  "Что можно есть при токсикозе?",
];

export function TriageAssistant() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ReturnType<typeof triageQuery> | null>(null);

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
          Напишите своими словами. При угрозе жизни не ждите ответа — сразу
          звоните <a href="tel:103">103</a>.
        </p>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={5}
          placeholder="Например: ребёнку 2 недели, температура 38.5, беспокоит сон"
        />
        <div className="triage-actions">
          <button type="button" className="btn-primary" onClick={() => analyze()}>
            Получить совет
          </button>
          <a className="btn-danger" href="tel:103">
            Позвонить 103
          </a>
        </div>
      </div>

      {result ? (
        <div className={`card triage-result triage-${result.level}`}>
          <p className="triage-level">{levelLabel(result.level)}</p>
          <h3>{result.title}</h3>
          <p>{result.advice}</p>
          <p>
            <strong>Что делать:</strong> {result.action}
          </p>
        </div>
      ) : null}

      <div className="card">
        <h3>Можно начать с примера</h3>
        <div className="triage-chips">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="triage-chip"
              onClick={() => analyze(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
