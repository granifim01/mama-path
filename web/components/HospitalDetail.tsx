"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { HospitalReviewForm } from "@/components/HospitalReviewForm";
import {
  cleanReviewText,
  facilityLabel,
  formatHospitalRating,
  formatPrice,
  sourceLabel,
} from "@/lib/display";
import { apiFetch } from "@/lib/api";
import type { Hospital } from "@/lib/types";

type Review = {
  id: number;
  author_name: string;
  rating: number | null;
  birth_type: string | null;
  text: string;
  created_at: string;
};

type Props = {
  hospitalId: string;
};

export function HospitalDetail({ hospitalId }: Props) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{
        hospital: Hospital;
        user_reviews: Review[];
      }>(`/api/v1/hospitals/${encodeURIComponent(hospitalId)}`);
      setHospital(data.hospital);
      setReviews(data.user_reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить");
      setHospital(null);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="card">Загружаем карточку роддома...</div>;
  }

  if (!hospital) {
    return (
      <div className="card empty-state">
        <p>{error || "Роддом не найден"}</p>
        <a href="/hospitals" className="btn-primary btn-sm">
          Вернуться к списку
        </a>
      </div>
    );
  }

  const paidBirth = hospital.services?.find((s) => /платн/i.test(s.title));

  return (
    <div className="detail-layout">
      <article className="card animate-in">
        <p className="muted">
          {hospital.city_name} · {facilityLabel(hospital.facility_type)}
        </p>
        <h1>{hospital.name}</h1>
        {formatHospitalRating(hospital.rating) ? (
          <p className="hospital-rating">{formatHospitalRating(hospital.rating)}</p>
        ) : null}
        {hospital.address ? <p>{hospital.address}</p> : null}
        {hospital.phone ? <p>{hospital.phone}</p> : null}
        {hospital.schedule ? <p>{hospital.schedule}</p> : null}

        <div className="tags">
          {hospital.free_birth_available ? (
            <span className="tag tag-green">Бесплатные роды возможны</span>
          ) : null}
          {hospital.has_paid_birth ? (
            <span className="tag tag-blue">Есть платные услуги</span>
          ) : null}
        </div>

        {paidBirth ? (
          <p className="price">
            {paidBirth.title}: {paidBirth.price_raw ?? formatPrice(paidBirth.price_from)}
          </p>
        ) : null}

        {hospital.services?.length ? (
          <div className="service-list">
            <h2>Цены и услуги</h2>
            <ul>
              {hospital.services.map((service) => (
                <li key={service.title}>
                  {service.title}: {service.price_raw ?? formatPrice(service.price_from)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="card-actions">
          <Link
            href={`/hospitals/compare?ids=${encodeURIComponent(hospital.id)}`}
            className="btn-secondary btn-sm"
          >
            Добавить к сравнению
          </Link>
          {hospital.sources?.map((source) =>
            source.detail_url ? (
              <a
                key={source.source}
                className="source-link"
                href={source.detail_url}
                target="_blank"
                rel="noreferrer"
              >
                Открыть на {sourceLabel(source.source)}
              </a>
            ) : null,
          )}
        </div>
      </article>

      <section className="card">
        <h2>Отзывы родителей ({reviews.length + (hospital.reviews?.length ?? 0)})</h2>
        {reviews.length === 0 && !hospital.reviews?.length ? (
          <p className="muted">Пока нет отзывов — будьте первыми, кто поделится опытом.</p>
        ) : null}
        {reviews.map((review) => (
          <blockquote className="review" key={review.id}>
            <strong>
              {review.author_name}
              {review.rating ? ` · ${review.rating}★` : ""}
            </strong>
            <p>{review.text}</p>
          </blockquote>
        ))}
        {hospital.reviews?.map((review, index) => (
          <blockquote className="review review-source" key={`src-${index}`}>
            <strong>{sourceLabel(review.source)}</strong>
            <p>«{cleanReviewText(review.text)}»</p>
          </blockquote>
        ))}
      </section>

      <HospitalReviewForm hospitalId={hospitalId} onSubmitted={load} />
    </div>
  );
}
