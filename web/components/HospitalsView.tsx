"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { HospitalCard } from "@/components/HospitalCard";
import { HospitalFilters } from "@/components/HospitalFilters";
import type { Hospital } from "@/lib/types";

const HospitalMap = dynamic(
  () => import("@/components/HospitalMap").then((mod) => mod.HospitalMap),
  { ssr: false },
);

const COMPARE_KEY = "mamapath-compare-ids";

type Props = {
  hospitals: Hospital[];
  cities: string[];
  cityNames: Record<string, string>;
  center: [number, number];
  currentCity?: string;
  currentQuery?: string;
  paidOnly?: boolean;
  freeOnly?: boolean;
  totalCount: number;
};

export function HospitalsView({
  hospitals,
  cities,
  cityNames,
  center,
  currentCity,
  currentQuery,
  paidOnly,
  freeOnly,
  totalCount,
}: Props) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_KEY);
      if (stored) {
        setCompareIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev;
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="layout">
      <HospitalFilters
        cities={cities}
        cityNames={cityNames}
        currentCity={currentCity}
        currentQuery={currentQuery}
        paidOnly={paidOnly}
        freeOnly={freeOnly}
      />

      <div className="content">
        {compareIds.length > 0 ? (
          <div className="compare-bar card">
            <span>Выбрано: {compareIds.length} из 3</span>
            <Link
              href={`/hospitals/compare?ids=${compareIds.map(encodeURIComponent).join(",")}`}
              className="btn-primary btn-sm"
            >
              Сравнить выбранные
            </Link>
          </div>
        ) : null}

        <HospitalMap hospitals={hospitals} center={center} />

        {hospitals.map((hospital, index) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
            index={index}
          />
        ))}

        {hospitals.length === 0 ? (
          <div className="card empty-state">
            <p>По вашим фильтрам ничего не нашлось.</p>
            <p>
              Всего в базе {totalCount} роддомов — попробуйте другой город или
              сбросьте фильтры.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
