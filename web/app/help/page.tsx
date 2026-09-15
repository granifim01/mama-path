import { PageIntro } from "@/components/PageIntro";
import { TriageAssistant } from "@/components/TriageAssistant";

export default function HelpPage() {
  return (
    <main className="shell">
      <PageIntro
        eyebrow="Бесплатно"
        title="Срочная помощь"
        description="Опишите ситуацию простыми словами — мы подскажем, насколько это срочно и что делать дальше. Это не диагноз и не замена врача."
      />
      <TriageAssistant />
    </main>
  );
}
