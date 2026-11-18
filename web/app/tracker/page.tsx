import type { Metadata } from "next";

import { PageIntro } from "@/components/PageIntro";
import { PregnancyTracker } from "@/components/PregnancyTracker";

export const metadata: Metadata = {
  title: "Календарь беременности по неделям — Mama Path",
};

export default function TrackerPage() {
  return (
    <main className="shell">
      <PageIntro
        eyebrow="Неделя за неделей"
        title="Календарь беременности"
        description="Укажите ПДР или дату последних месячных — покажем текущую неделю, что происходит с малышом и с вами, и что важно сделать сейчас."
      />
      <PregnancyTracker />
    </main>
  );
}
