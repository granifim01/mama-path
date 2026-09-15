"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

type Props = {
  hospitalId: string;
  onSubmitted: () => void;
};

const MIN_LENGTH = 20;

export function HospitalReviewForm({ hospitalId, onSubmitted }: Props) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [birthType, setBirthType] = useState("natural");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = Boolean(getToken());

  const charsLeft = MIN_LENGTH - text.trim().length;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!isLoggedIn && !authorName.trim()) {
      setError("Укажите, как подписать отзыв");
      return;
    }
    if (text.trim().length < MIN_LENGTH) {
      setError(`Напишите чуть подробнее — ещё ${charsLeft} символов`);
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/api/v1/hospitals/${encodeURIComponent(hospitalId)}/reviews`, {
        method: "POST",
        token: getToken() ?? undefined,
        body: JSON.stringify({
          author_name: authorName,
          rating,
          birth_type: birthType,
          text: text.trim(),
        }),
      });
      setText("");
      setSuccess(true);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить отзыв");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card review-form animate-in" onSubmit={submit} noValidate>
      <h2>Поделиться опытом</h2>
      <p className="muted">
        Ваш отзыв поможет другим родителям выбрать роддом.
      </p>

      {!isLoggedIn ? (
        <label>
          Ваше имя
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Например: Айгуль"
          />
        </label>
      ) : null}

      <label>
        Ваша оценка
        <div className="star-picker" role="group" aria-label="Оценка от 1 до 5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`star-picker__btn ${value <= rating ? "is-active" : ""}`}
              onClick={() => setRating(value)}
              aria-label={`${value} из 5`}
            >
              ★
            </button>
          ))}
          <span className="star-picker__label">{rating} из 5</span>
        </div>
      </label>

      <label>
        Как прошли роды
        <select value={birthType} onChange={(e) => setBirthType(e.target.value)}>
          <option value="natural">Естественные</option>
          <option value="cesarean">Кесарево сечение</option>
          <option value="planned">Плановые</option>
          <option value="other">Другое</option>
        </select>
      </label>

      <label>
        Ваш отзыв
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Расскажите, что понравилось и что стоит учесть другим"
        />
        <span className={`char-counter ${charsLeft <= 0 ? "is-ready" : ""}`}>
          {charsLeft <= 0
            ? "Можно отправлять"
            : `Ещё ${charsLeft} символов до минимума`}
        </span>
      </label>

      {error ? <p className="auth-error">{error}</p> : null}
      {success ? <p className="form-success">Спасибо! Отзыв опубликован.</p> : null}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Отправляем..." : "Опубликовать отзыв"}
      </button>
    </form>
  );
}
