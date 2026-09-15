export type TriageLevel = "emergency" | "urgent" | "doctor" | "observe";

export type TriageResult = {
  level: TriageLevel;
  title: string;
  advice: string;
  action: string;
};

type Rule = {
  keywords: string[];
  level: TriageLevel;
  title: string;
  advice: string;
  action: string;
};

const RULES: Rule[] = [
  {
    keywords: ["не дышит", "задохнул", "синюшн", "синий", "без сознания", "судорог"],
    level: "emergency",
    title: "Экстренная ситуация",
    advice: "Возможна угроза жизни. Не ждите ответа в приложении.",
    action: "Немедленно звоните 103 или скорую помощь.",
  },
  {
    keywords: ["кровотечен", "кровь обильн", "воды отошл", "схватк", "роды начал"],
    level: "urgent",
    title: "Срочно — возможны роды или осложнение",
    advice: "При кровотечении, отхождении вод или регулярных схватках нужна помощь.",
    action: "Звоните 103 или езжайте в роддом / к врачу сейчас.",
  },
  {
    keywords: ["температур", "38", "39", "40", "жар"],
    level: "urgent",
    title: "Высокая температура",
    advice: "Температура 38°C+ у беременной или новорождённого требует оценки врача.",
    action: "Свяжитесь с врачом или вызовите скорую, если ребёнку меньше 1 месяца.",
  },
  {
    keywords: ["не шевел", "не двига", "тупн", "вял"],
    level: "urgent",
    title: "Снижение шевелений плода",
    advice: "Резкое уменьшение шевелений — повод для срочной оценки.",
    action: "Позвоните в женскую консультацию или поезжайте в приёмное отделение.",
  },
  {
    keywords: ["тошнот", "рвот", "изжог", "насморк", "простуд"],
    level: "doctor",
    title: "Симптомы для консультации врача",
    advice: "Симптом не выглядит экстренным, но требует медицинской оценки.",
    action: "Запишитесь к врачу в ближайшие 24–48 часов.",
  },
  {
    keywords: ["питани", "диет", "витамин", "фолиев", "что можно есть"],
    level: "observe",
    title: "Общий вопрос по уходу",
    advice: "Это образовательный вопрос. Используйте курсы и проверенные источники.",
    action: "При сомнениях уточните у вашего врача.",
  },
];

const LEVEL_LABELS: Record<TriageLevel, string> = {
  emergency: "🚨 Немедленно — звоните 103",
  urgent: "⚠️ Срочно — нужна помощь сейчас",
  doctor: "🩺 Запишитесь к врачу",
  observe: "ℹ️ Не срочно — можно уточнить позже",
};

export function triageQuery(input: string): TriageResult {
  const text = input.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return {
        level: rule.level,
        title: rule.title,
        advice: rule.advice,
        action: rule.action,
      };
    }
  }

  return {
    level: "doctor",
    title: "Нужна консультация специалиста",
    advice:
      "Мы не нашли точного совпадения. Это не диагноз — только ориентир.",
    action: "Опишите симптомы врачу или обратитесь в 103 при ухудшении.",
  };
}

export function levelLabel(level: TriageLevel): string {
  return LEVEL_LABELS[level];
}
