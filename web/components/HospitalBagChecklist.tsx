"use client";

import { useEffect, useState } from "react";

import { CHECKLIST_TOTAL, HOSPITAL_BAG } from "@/lib/checklist";

const KEY = "mama-path:hospital-bag";

function readChecked(): Set<string> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function HospitalBagChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hideDone, setHideDone] = useState(false);

  useEffect(() => {
    setChecked(readChecked());
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        // ignore — works for the session
      }
      return next;
    });
  }

  function clearAll() {
    setChecked(new Set());
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }

  const done = checked.size;
  const percent = Math.round((done / CHECKLIST_TOTAL) * 100);

  return (
    <div className="checklist">
      <div className="card checklist-summary">
        <div>
          <p className="eyebrow">Собрано</p>
          <h2>
            {done} из {CHECKLIST_TOTAL}
            {percent === 100 ? " — сумка готова! 🎉" : ""}
          </h2>
          <div className="progress-bar" aria-label={`Собрано ${percent}%`}>
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="checklist-summary__actions">
          <label className="checkbox">
            <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
            Скрыть собранное
          </label>
          <button type="button" className="btn-ghost" onClick={() => window.print()}>🖨 Распечатать</button>
          {done > 0 ? (
            <button type="button" className="btn-text" onClick={clearAll}>Очистить</button>
          ) : null}
        </div>
      </div>

      <div className="checklist-groups">
        {HOSPITAL_BAG.map((group) => {
          const groupDone = group.items.filter((item) => checked.has(item.id)).length;
          const items = hideDone ? group.items.filter((item) => !checked.has(item.id)) : group.items;
          return (
            <section className="card checklist-group" key={group.id}>
              <header>
                <h3>
                  <span aria-hidden>{group.icon}</span> {group.title}
                </h3>
                <span className={`badge ${groupDone === group.items.length ? "badge--done" : ""}`}>
                  {groupDone}/{group.items.length}
                </span>
              </header>
              {group.hint ? <p className="muted small">{group.hint}</p> : null}
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <label className={`check-item ${checked.has(item.id) ? "is-done" : ""}`}>
                      <input type="checkbox" checked={checked.has(item.id)} onChange={() => toggle(item.id)} />
                      <span className="check-item__box" aria-hidden />
                      <span>
                        {item.label}
                        {item.note ? <small>{item.note}</small> : null}
                      </span>
                    </label>
                  </li>
                ))}
                {items.length === 0 ? <li className="muted small">Всё собрано ✓</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
