"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getStoredDueDate,
  parseIsoDate,
  setStoredDueDate,
  toIsoDate,
} from "@/lib/due-date-storage";
import {
  PREGNANCY_WEEKS,
  dueDateFromLmp,
  getWeekInfo,
  trimesterOf,
  weekFromDueDate,
} from "@/lib/pregnancy-weeks";

type Mode = "due" | "lmp";

const DATE_FMT = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

function pluralDays(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
}

export function PregnancyTracker() {
  const [mode, setMode] = useState<Mode>("due");
  const [input, setInput] = useState("");
  const [dueIso, setDueIso] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredDueDate();
    if (stored && parseIsoDate(stored)) {
      setDueIso(stored);
      setInput(stored);
    }
  }, []);

  const status = useMemo(() => {
    const due = dueIso ? parseIsoDate(dueIso) : null;
    if (!due) return null;
    return { due, ...weekFromDueDate(due) };
  }, [dueIso]);

  const currentWeek = status ? Math.min(40, Math.max(4, status.week)) : null;
  const shownWeek = selectedWeek ?? currentWeek ?? 20;
  const info = getWeekInfo(shownWeek);

  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>(`[data-week="${shownWeek}"]`);
    if (strip && active) {
      strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2, behavior: "smooth" });
    }
  }, [shownWeek]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const date = parseIsoDate(input);
    if (!date) return;
    const due = mode === "lmp" ? dueDateFromLmp(date) : date;
    const iso = toIsoDate(due);
    setDueIso(iso);
    setSelectedWeek(null);
    setStoredDueDate(iso);
    if (mode === "lmp") {
      setMode("due");
      setInput(iso);
    }
  }

  function reset() {
    setDueIso(null);
    setInput("");
    setSelectedWeek(null);
    setStoredDueDate(null);
  }

  const progress = status ? Math.min(100, Math.max(0, ((280 - status.daysLeft) / 280) * 100)) : 0;
  const outOfRange = status && (status.week < 4 || status.daysLeft < -14);

  return (
    <div className="tracker">
      <form className="card tracker-form" onSubmit={submit}>
        <div className="segmented" role="tablist" aria-label="Способ расчёта">
          <button type="button" role="tab" aria-selected={mode === "due"} className={mode === "due" ? "is-active" : ""} onClick={() => setMode("due")}>
            По дате родов (ПДР)
          </button>
          <button type="button" role="tab" aria-selected={mode === "lmp"} className={mode === "lmp" ? "is-active" : ""} onClick={() => setMode("lmp")}>
            По последним месячным
          </button>
        </div>
        <label className="tracker-form__field">
          <span>{mode === "due" ? "Предполагаемая дата родов" : "Первый день последних месячных"}</span>
          <input type="date" value={input} onChange={(e) => setInput(e.target.value)} required />
        </label>
        <div className="tracker-form__actions">
          <button type="submit" className="btn-primary">Рассчитать</button>
          {dueIso ? (
            <button type="button" className="btn-text" onClick={reset}>Сбросить</button>
          ) : null}
        </div>
        <p className="muted small">Дата хранится только в вашем браузере.</p>
      </form>

      {status && !outOfRange ? (
        <section className="card tracker-status">
          <div className="tracker-status__ring" style={{ ["--p" as string]: `${progress}%` }}>
            <div>
              <strong>{Math.max(0, status.week)}</strong>
              <span>неделя</span>
            </div>
          </div>
          <div className="tracker-status__text">
            <p className="eyebrow">{trimesterOf(status.week)} триместр · {status.week} нед. {status.day} дн.</p>
            <h2>
              {status.daysLeft > 0
                ? `До встречи ${status.daysLeft} ${pluralDays(status.daysLeft)}`
                : status.daysLeft === 0
                  ? "Сегодня ПДР!"
                  : "ПДР уже прошла — малыш может появиться в любой день"}
            </h2>
            <p className="muted">ПДР: {DATE_FMT.format(status.due)}</p>
            <div className="progress-bar" aria-hidden><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </section>
      ) : status && outOfRange ? (
        <section className="card tracker-status">
          <p>Похоже, дата за пределами беременности (4–42 недели). Проверьте, правильно ли она введена.</p>
        </section>
      ) : null}

      <div className="week-strip" ref={stripRef} role="tablist" aria-label="Недели беременности">
        {PREGNANCY_WEEKS.map((w) => (
          <button
            key={w.week}
            type="button"
            data-week={w.week}
            role="tab"
            aria-selected={w.week === shownWeek}
            className={[
              "week-chip",
              w.week === shownWeek ? "is-active" : "",
              w.week === currentWeek ? "is-current" : "",
              currentWeek && w.week < currentWeek ? "is-past" : "",
            ].join(" ")}
            onClick={() => setSelectedWeek(w.week)}
          >
            <span aria-hidden>{w.emoji}</span>
            {w.week}
          </button>
        ))}
      </div>

      <article className="week-card card" key={info.week}>
        <div className="week-card__hero">
          <span className="week-card__emoji" aria-hidden>{info.emoji}</span>
          <div>
            <p className="eyebrow">
              {info.week} неделя · {trimesterOf(info.week)} триместр
              {info.week === currentWeek ? " · сейчас" : ""}
            </p>
            <h2>Малыш размером с {info.size}</h2>
            <div className="week-card__metrics">
              <span><small>Рост</small>{info.length}</span>
              <span><small>Вес</small>{info.weight}</span>
            </div>
          </div>
        </div>
        <div className="week-card__grid">
          <div className="week-card__block">
            <h3>👶 Малыш</h3>
            <p>{info.baby}</p>
          </div>
          <div className="week-card__block">
            <h3>🤰 Мама</h3>
            <p>{info.mom}</p>
          </div>
          <div className="week-card__block week-card__block--tip">
            <h3>💡 Совет недели</h3>
            <p>{info.tip}</p>
          </div>
        </div>
        <div className="week-card__footer">
          {info.chapter ? (
            <Link href={`/courses/${info.chapter.track}/${info.chapter.id}`} className="btn-secondary">
              📖 Читать: {info.chapter.title}
            </Link>
          ) : <span />}
          <div className="week-card__nav">
            <button type="button" className="btn-ghost" disabled={info.week <= 4} onClick={() => setSelectedWeek(info.week - 1)}>←</button>
            <button type="button" className="btn-ghost" disabled={info.week >= 40} onClick={() => setSelectedWeek(info.week + 1)}>→</button>
          </div>
        </div>
      </article>

      <p className="muted small">
        Размеры и вес — средние значения, у каждого малыша свой темп. Срок по УЗИ может отличаться от расчёта — ориентируйтесь на данные вашего врача.
      </p>
    </div>
  );
}
