/**
 * Собирает courses.json с трёхъязычной структурой и расширенным контентом.
 */
import fs from "fs";
import path from "path";

import {
  CHAPTER_META_I18N,
  EXTRA_SECTIONS_I18N,
  HEADING_I18N,
  PHASE_I18N,
  QUIZ_I18N,
  SECTION_BODY_I18N,
  TRACK_I18N,
  type L,
} from "./i18n/course-pack";

type RawSection = { heading: string; body: string };
type RawChapter = {
  id: string;
  order: number;
  phase: string;
  phase_label: string;
  title: string;
  duration_min: number;
  is_premium: boolean;
  summary: string;
  sections: RawSection[];
  quiz: {
    pass_score: number;
    questions: Array<{
      id: string;
      text: string;
      options: string[];
      correct_index: number;
    }>;
  };
};

const PHASE_CHECKLIST: Record<string, L> = {
  planning: {
    ru: "Запишите вопросы врачу заранее. Возьмите результаты прошлых анализов. Обсудите с партнёром ожидания от родов и первых месяцев.",
    kk: "Сұрақтарды алдын ала жазып алыңыз. Ескі талдау нәтижелерін алыңыз. Босану мен алғашқы айлар туралы серіктесіңізбен сөйлесіңіз.",
    en: "Write questions for your doctor in advance. Bring previous test results. Discuss birth and early months with your partner.",
  },
  "trimester-1": {
    ru: "Встаньте на учёт в женской консультации. Уточните график анализов и УЗИ. Держите под рукой телефон врача и номер 103.",
    kk: "Әйелдер консультациясында есепке тұрыңыз. Талдау мен УДЗ кестесін нақтылаңыз. Дәрігер телефоны мен 103 нөмірін жанында ұстаңыз.",
    en: "Register at the women's clinic. Confirm your test and ultrasound schedule. Keep your doctor's number and 103 handy.",
  },
  "trimester-2": {
    ru: "Следите за шевелениями плода. Пейте достаточно воды. Не назначайте витамины и лекарства сами — только по рекомендации врача.",
    kk: "Бала қозғалысын бақылаңыз. Жеткілікті су ішіңіз. Дәрі-дәрмек пен витаминдерді өз бетіңізше қабылдамаңыз — тек дәрігер ұсынысы бойынша.",
    en: "Track fetal movements. Drink enough water. Do not take vitamins or medicines on your own — only as your doctor recommends.",
  },
  "trimester-3": {
    ru: "Соберите сумку в роддом к 36-й неделе. Выберите роддом и проложите маршрут. Обсудите план родов с партнёром и врачом.",
    kk: "36-аптаға дейін босана үйі сөмкесін жинаңыз. Босана үйін таңдап, маршрутты анықтаңыз. Босану жоспарын серіктес пен дәрігермен талқылаңыз.",
    en: "Pack your hospital bag by week 36. Choose a hospital and plan the route. Discuss your birth plan with your partner and doctor.",
  },
  birth: {
    ru: "При схватках, отхождении вод или кровотечении — звоните врачу или 103. Держите телефон заряженным и документы под рукой.",
    kk: "Қысу, су ағу немесе қан кету кезінде дәрігерге немесе 103-ке қоңырау шалыңыз. Телефон зарядталған, құжаттар қолда болсын.",
    en: "If you have contractions, leaking fluid, or bleeding — call your doctor or 103. Keep your phone charged and documents ready.",
  },
  infant: {
    ru: "Следите за температурой, сном и кормлением малыша. Плановые визиты к педиатру — по графику. При ухудшении состояния — сразу к врачу.",
    kk: "Сәбидің температурасы, ұйқысы мен тамақтануын бақылаңыз. Педиатрға жоспарлы бару кестесін ұстаныңыз. Жағдай нашарласа — дереу дәрігерге.",
    en: "Monitor your baby's temperature, sleep, and feeding. Keep pediatric visits on schedule. If condition worsens — see a doctor immediately.",
  },
};

const EMERGENCY_NOTE: L = {
  ru: "Материал носит образовательный характер и не заменяет консультацию врача. При угрозе жизни звоните 103.",
  kk: "Материал білім беру сипатында және дәрігер кеңесін алмастырмайды. Өмірге қауіп төнсе 103 қоңырау шалыңыз.",
  en: "This content is educational and does not replace medical advice. If life is at risk, call 103.",
};

function headingL(heading: string): L {
  return HEADING_I18N[heading] ?? { ru: heading, kk: heading, en: heading };
}

function bodyL(chapter: RawChapter, section: RawSection): L {
  const sectionKey = `${chapter.id}::${section.heading}`;
  const sectionBodyI18n = SECTION_BODY_I18N[sectionKey];
  if (sectionBodyI18n) {
    return sectionBodyI18n;
  }

  if (section.heading === "Важно") {
    return EMERGENCY_NOTE;
  }
  if (section.heading === "Чек-лист") {
    return PHASE_CHECKLIST[chapter.phase] ?? {
      ru: section.body,
      kk: section.body,
      en: section.body,
    };
  }
  if (section.heading === "Коротко о главе") {
    const meta = CHAPTER_META_I18N[chapter.id];
    if (meta) {
      return {
        ru: `${meta.summary.ru} Это ориентир для разговора с врачом, а не медицинское назначение.`,
        kk: `${meta.summary.kk} Бұл дәрігермен сөйлесуге арналған бағдар, медициналық тағайындау емес.`,
        en: `${meta.summary.en} This is guidance for talking with your doctor, not a medical prescription.`,
      };
    }
  }
  return { ru: section.body, kk: section.body, en: section.body };
}

function main() {
  const coursesPath = path.join(process.cwd(), "..", "data", "courses.json");
  const raw = JSON.parse(fs.readFileSync(coursesPath, "utf-8"));

  const tracks = raw.tracks.map((track: { id: "mother" | "father"; color: string; chapters: RawChapter[] }) => {
    const trackI18n = TRACK_I18N[track.id];
    return {
      id: track.id,
      title: trackI18n.title,
      subtitle: trackI18n.subtitle,
      color: track.color,
      chapters: track.chapters.map((chapter) => {
        const meta = CHAPTER_META_I18N[chapter.id];
        const phase = chapter.phase as keyof typeof PHASE_I18N;
        const phaseI18n = PHASE_I18N[phase];

        const sections = [
          ...chapter.sections.map((section) => ({
            heading: headingL(section.heading),
            body: bodyL(chapter, section),
          })),
          ...(EXTRA_SECTIONS_I18N[chapter.id] ?? []).map((extra) => ({
            heading: extra.heading,
            body: extra.body,
          })),
        ];

        const quizPack = QUIZ_I18N[chapter.id];
        const quiz = quizPack
          ? {
              pass_score: chapter.quiz.pass_score,
              questions: quizPack.questions.map((q, index) => {
                const source = chapter.quiz.questions[index];
                return {
                  id: q.id,
                  text: q.text,
                  options: q.options,
                  correct_index: source?.correct_index ?? 0,
                };
              }),
            }
          : {
              pass_score: chapter.quiz.pass_score,
              questions: chapter.quiz.questions.map((q) => ({
                id: q.id,
                text: { ru: q.text, kk: q.text, en: q.text },
                options: q.options.map((o) => ({ ru: o, kk: o, en: o })),
                correct_index: q.correct_index,
              })),
            };

        return {
          id: chapter.id,
          order: chapter.order,
          phase: chapter.phase,
          phase_label: phaseI18n?.phase_label ?? {
            ru: chapter.phase_label,
            kk: chapter.phase_label,
            en: chapter.phase_label,
          },
          title: meta?.title ?? { ru: chapter.title, kk: chapter.title, en: chapter.title },
          duration_min: chapter.duration_min + 3,
          is_premium: chapter.is_premium,
          summary: meta?.summary ?? { ru: chapter.summary, kk: chapter.summary, en: chapter.summary },
          sections,
          quiz,
        };
      }),
    };
  });

  const output = {
    updated_at: new Date().toISOString(),
    tracks,
  };

  fs.writeFileSync(coursesPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Built i18n courses → ${coursesPath}`);
}

main();
