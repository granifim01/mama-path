"use client";

import Link from "next/link";

import {
  cleanReviewText,
  facilityLabel,
  formatHospitalRating,
  formatPrice,
  sanitizeDisplayText,
  sourceLabel,
} from "@/lib/display";
import type { Hospital } from "@/lib/types";

type Props = {
  hospital: Hospital;
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
  index?: number;
};

export function HospitalCard({
  hospital,
  compareIds = [],
  onToggleCompare,
  index = 0,
}: Props) {
  const paidBirth = hospital.services?.find((service) =>
    /платн/i.test(service.title),
  );
  const inCompare = compareIds.includes(hospital.id);
  const ratingLabel = formatHospitalRating(hospital.rating);
  const reviewText = hospital.reviews?.[0]
    ? cleanReviewText(hospital.reviews[0].text)
    : null;

  return (
    <article
      className="card hospital-card animate-in"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="card-header">
        <div>
          <h3>
            <Link href={`/hospitals/${encodeURIComponent(hospital.id)}`}>
              {sanitizeDisplayText(hospital.name)}
            </Link>
          </h3>
          <p className="muted">
            {hospital.city_name} · {facilityLabel(hospital.facility_type)}
          </p>
        </div>
        {ratingLabel ? <span className="badge">{ratingLabel}</span> : null}
      </div>

      {hospital.address ? (
        <p className="address">{sanitizeDisplayText(hospital.address)}</p>
      ) : null}
      {hospital.phone ? <p className="phone">{hospital.phone}</p> : null}
      {hospital.schedule ? <p className="schedule">{hospital.schedule}</p> : null}

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

      {reviewText ? (
        <blockquote className="review">«{reviewText}»</blockquote>
      ) : null}

      <div className="card-actions">
        <Link
          href={`/hospitals/${encodeURIComponent(hospital.id)}`}
          className="btn-secondary btn-sm"
        >
          Подробнее
        </Link>
        {onToggleCompare ? (
          <button
            type="button"
            className={`btn-ghost btn-sm ${inCompare ? "is-active" : ""}`}
            onClick={() => onToggleCompare(hospital.id)}
          >
            {inCompare ? "✓ В сравнении" : "Сравнить"}
          </button>
        ) : null}
        {hospital.sources?.map((source) =>
          source.detail_url ? (
            <a
              key={`${source.source}-${source.source_id}`}
              className="source-link"
              href={source.detail_url}
              target="_blank"
              rel="noreferrer"
            >
              {sourceLabel(source.source)}
            </a>
          ) : null,
        )}
      </div>
    </article>
  );
}
