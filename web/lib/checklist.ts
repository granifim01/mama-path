export type ChecklistGroup = {
  id: string;
  title: string;
  icon: string;
  hint?: string;
  items: { id: string; label: string; note?: string }[];
};

/**
 * Hospital bag checklist. Rules differ between maternity hospitals in
 * Kazakhstan — the UI reminds parents to confirm the list with their hospital.
 */
export const HOSPITAL_BAG: ChecklistGroup[] = [
  {
    id: "docs",
    title: "Документы",
    icon: "📄",
    hint: "Держите в одной прозрачной папке — отдадите в приёмном покое.",
    items: [
      { id: "docs-id", label: "Удостоверение личности", note: "Оригинал + копия" },
      { id: "docs-card", label: "Обменная карта беременной" },
      { id: "docs-direction", label: "Направление на госпитализацию", note: "Если выдавала консультация" },
      { id: "docs-contract", label: "Договор с роддомом", note: "Для платных родов" },
      { id: "docs-results", label: "Свежие анализы и заключения УЗИ" },
      { id: "docs-osms", label: "Статус в ОСМС (проверить в eGov)" },
    ],
  },
  {
    id: "birth",
    title: "На роды",
    icon: "💪",
    items: [
      { id: "birth-shirt", label: "Ночная рубашка или футболка" },
      { id: "birth-socks", label: "Тёплые носки" },
      { id: "birth-slippers", label: "Моющиеся тапочки" },
      { id: "birth-water", label: "Вода без газа 1–1,5 л", note: "С трубочкой или спортивной крышкой" },
      { id: "birth-lip", label: "Гигиеническая помада" },
      { id: "birth-hair", label: "Резинка для волос" },
      { id: "birth-phone", label: "Телефон и длинная зарядка", note: "Кабель 2 м — розетки бывают далеко" },
    ],
  },
  {
    id: "mom",
    title: "Маме после родов",
    icon: "🌸",
    items: [
      { id: "mom-pads", label: "Послеродовые прокладки", note: "2–3 упаковки" },
      { id: "mom-panties", label: "Одноразовые трусы-сетки", note: "5–7 штук" },
      { id: "mom-bra", label: "Бюстгальтер для кормления" },
      { id: "mom-inserts", label: "Вкладыши для груди" },
      { id: "mom-cream", label: "Крем с ланолином для сосков" },
      { id: "mom-robe", label: "Халат и рубашка для кормления" },
      { id: "mom-hygiene", label: "Зубная щётка, паста, шампунь, гель" },
      { id: "mom-towel", label: "Полотенце, расчёска" },
      { id: "mom-cup", label: "Кружка, ложка, перекус", note: "Печенье, сухофрукты" },
    ],
  },
  {
    id: "baby",
    title: "Малышу",
    icon: "👶",
    items: [
      { id: "baby-diapers", label: "Подгузники NB", note: "1 упаковка" },
      { id: "baby-wipes", label: "Влажные салфетки 0+" },
      { id: "baby-cream", label: "Крем под подгузник" },
      { id: "baby-bodies", label: "Боди или распашонки", note: "3–4 шт." },
      { id: "baby-pants", label: "Ползунки или слип", note: "3–4 шт." },
      { id: "baby-hat", label: "Шапочка и носочки" },
      { id: "baby-mittens", label: "Царапки" },
      { id: "baby-swaddle", label: "Пелёнки", note: "2–3 шт., если роддом не выдаёт" },
    ],
  },
  {
    id: "discharge",
    title: "На выписку",
    icon: "🎀",
    hint: "Этот пакет может привезти папа в день выписки.",
    items: [
      { id: "dis-mom", label: "Одежда для мамы по сезону" },
      { id: "dis-baby", label: "Комплект для малыша по сезону" },
      { id: "dis-envelope", label: "Конверт или комбинезон" },
      { id: "dis-carseat", label: "Автокресло 0+", note: "Установить в машину заранее!" },
    ],
  },
];

export const CHECKLIST_TOTAL = HOSPITAL_BAG.reduce((sum, group) => sum + group.items.length, 0);
