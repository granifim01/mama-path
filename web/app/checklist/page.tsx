import type { Metadata } from "next";

import { HospitalBagChecklist } from "@/components/HospitalBagChecklist";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Чек-лист сумки в роддом — Mama Path",
};

export default function ChecklistPage() {
  return (
    <main className="shell">
      <PageIntro
        eyebrow="Собрать к 36 неделе"
        title="Сумка в роддом"
        description="Отмечайте собранное — прогресс сохранится в браузере. Списки в роддомах отличаются: уточните правила в своём заранее."
      />
      <HospitalBagChecklist />
    </main>
  );
}
