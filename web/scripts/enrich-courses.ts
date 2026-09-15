/**
 * Безопасное обогащение глав: только локальные шаблоны, без сети.
 * Добавляет практические блоки к главам с малым числом секций.
 */
import fs from "fs";
import path from "path";

type Section = { heading: string; body: string };
type Chapter = {
  id: string;
  title: string;
  phase: string;
  phase_label: string;
  summary: string;
  sections: Section[];
};

const PHASE_CHECKLISTS: Record<string, string> = {
  planning:
    "Запишите вопросы врачу заранее. Возьмите результаты прошлых анализов. Обсудите с партнёром ожидания от родов и первых месяцев.",
  "trimester-1":
    "Встаньте на учёт в женской консультации. Уточните график анализов и УЗИ. Держите под рукой телефон врача и номер 103.",
  "trimester-2":
    "Следите за шевелениями плода. Пейте достаточно воды. Не назначайте витамины и лекарства сами — только по рекомендации врача.",
  "trimester-3":
    "Соберите сумку в роддом к 36-й неделе. Выберите роддом и проложите маршрут. Обсудите план родов с партнёром и врачом.",
  birth:
    "При схватках, отхождении вод или кровотечении — звоните врачу или 103. Держите телефон заряженным и документы под рукой.",
  infant:
    "Следите за температурой, сном и кормлением малыша. Плановые визиты к педиатру — по графику. При ухудшении состояния — сразу к врачу.",
};

const EMERGENCY_NOTE =
  "Материал носит образовательный характер и не заменяет консультацию врача. При угрозе жизни звоните 103.";

function enrichChapter(chapter: Chapter): Chapter {
  const sections = [...chapter.sections];
  const headings = new Set(sections.map((s) => s.heading));

  const checklist = PHASE_CHECKLISTS[chapter.phase];
  if (checklist && !headings.has("Чек-лист")) {
    sections.push({ heading: "Чек-лист", body: checklist });
  }

  if (!headings.has("Коротко о главе")) {
    sections.push({
      heading: "Коротко о главе",
      body: `${chapter.summary} Это ориентир для разговора с врачом, а не медицинское назначение.`,
    });
  }

  if (!headings.has("Важно")) {
    sections.push({ heading: "Важно", body: EMERGENCY_NOTE });
  }

  return { ...chapter, sections };
}

function main() {
  const coursesPath = path.join(process.cwd(), "..", "data", "courses.json");
  const data = JSON.parse(fs.readFileSync(coursesPath, "utf-8"));

  let enriched = 0;
  for (const track of data.tracks) {
    track.chapters = track.chapters.map((chapter: Chapter) => {
      const next = enrichChapter(chapter);
      if (next.sections.length > chapter.sections.length) {
        enriched += 1;
      }
      return next;
    });
  }

  data.updated_at = new Date().toISOString();
  fs.writeFileSync(coursesPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Enriched ${enriched} chapters in ${coursesPath}`);
}

main();
