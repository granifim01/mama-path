"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getStoredDueDate, parseIsoDate } from "@/lib/due-date-storage";
import { getWeekInfo, trimesterOf, weekFromDueDate } from "@/lib/pregnancy-weeks";

type State = { week: number; daysLeft: number } | null;

export function WeekWidget() {
  const [state, setState] = useState<State>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      const due = parseIsoDate(getStoredDueDate() ?? "");
      if (due) {
        const s = weekFromDueDate(due);
        setState(s.week >= 4 && s.daysLeft >= -14 ? s : null);
      } else {
        setState(null);
      }
      setReady(true);
    };
    read();
    window.addEventListener("mama-path:due-date", read);
    return () => window.removeEventListener("mama-path:due-date", read);
  }, []);

  const info = getWeekInfo(state ? state.week : 20);

  return (
    <Link href="/tracker" className={`week-widget ${ready ? "is-ready" : ""}`} aria-label="Календарь беременности">
      <div className="week-widget__blob" aria-hidden />
      <span className="week-widget__emoji" aria-hidden>{info.emoji}</span>
      {state ? (
        <>
          <p className="eyebrow">Ваша {Math.min(40, state.week)} неделя · {trimesterOf(state.week)} триместр</p>
          <h2>Малыш размером с {info.size}</h2>
          <p className="week-widget__tip">💡 {info.tip}</p>
          <span className="week-widget__link">
            {state.daysLeft > 0 ? `До ПДР ${state.daysLeft} дн.` : "ПДР наступила"} · Открыть календарь →
          </span>
        </>
      ) : (
        <>
          <p className="eyebrow">Календарь беременности</p>
          <h2>Узнайте, что происходит с малышом на этой неделе</h2>
          <p className="week-widget__tip">Размер, развитие, самочувствие мамы и совет недели — с 4 по 40 неделю.</p>
          <span className="week-widget__link">Указать дату родов →</span>
        </>
      )}
    </Link>
  );
}
