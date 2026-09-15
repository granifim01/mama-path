"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { facilityLabel, formatHospitalRating, formatPrice } from "@/lib/display";
import type { Hospital } from "@/lib/types";

type Props = {
  ids: string[];
};

export function HospitalCompare({ ids }: Props) {
  const [items, setItems] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(Boolean(ids.length));

  useEffect(() => {
    async function load() {
      setLoading(true);
      const loaded: Hospital[] = [];
      for (const id of ids) {
        try {
          const data = await apiFetch<{ hospital: Hospital }>(
            `/api/v1/hospitals/${encodeURIComponent(id)}`,
          );
          loaded.push(data.hospital);
        } catch {
          // skip missing
        }
      }
      setItems(loaded);
      setLoading(false);
    }
    if (ids.length) {
      load();
    }
  }, [ids]);

  if (!ids.length) {
    return (
      <div className="card empty-state">
        <p>Пока ничего не выбрано.</p>
        <p>Откройте список роддомов и нажмите «Сравнить» у понравившихся — можно выбрать до трёх.</p>
        <Link href="/hospitals" className="btn-primary btn-sm">
          Перейти к списку
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="card">Загружаем данные для сравнения...</div>;
  }

  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Что сравниваем</th>
            {items.map((item) => (
              <th key={item.id}>
                <Link href={`/hospitals/${encodeURIComponent(item.id)}`}>
                  {item.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Город</td>
            {items.map((item) => (
              <td key={item.id}>{item.city_name}</td>
            ))}
          </tr>
          <tr>
            <td>Тип учреждения</td>
            {items.map((item) => (
              <td key={item.id}>{facilityLabel(item.facility_type)}</td>
            ))}
          </tr>
          <tr>
            <td>Адрес</td>
            {items.map((item) => (
              <td key={item.id}>{item.address ?? "—"}</td>
            ))}
          </tr>
          <tr>
            <td>Бесплатные роды</td>
            {items.map((item) => (
              <td key={item.id}>
                {item.free_birth_available
                  ? "Да"
                  : item.free_birth_available === false
                    ? "Нет"
                    : "—"}
              </td>
            ))}
          </tr>
          <tr>
            <td>Платные услуги</td>
            {items.map((item) => (
              <td key={item.id}>{item.has_paid_birth ? "Да" : "—"}</td>
            ))}
          </tr>
          <tr>
            <td>Платные роды от</td>
            {items.map((item) => {
              const paid = item.services?.find((s) => /платн/i.test(s.title));
              return (
                <td key={item.id}>
                  {paid ? paid.price_raw ?? formatPrice(paid.price_from) : "—"}
                </td>
              );
            })}
          </tr>
          <tr>
            <td>Рейтинг</td>
            {items.map((item) => (
              <td key={item.id}>{formatHospitalRating(item.rating) ?? "—"}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
