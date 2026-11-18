import Link from "next/link";

const STAGES = [
  {
    icon: "🌱",
    title: "Планирование",
    text: "Анализы, фолиевая кислота, эмоциональная готовность пары.",
    links: [
      { href: "/courses/mother/m-01", label: "Подготовка к зачатию" },
      { href: "/courses/father/f-01", label: "Роль отца" },
    ],
  },
  {
    icon: "🤍",
    title: "1 триместр",
    text: "Учёт в консультации, первый скрининг, как пережить токсикоз.",
    links: [
      { href: "/courses/mother/m-04", label: "Анализы и УЗИ" },
      { href: "/courses/father/f-03", label: "Помощь при токсикозе" },
    ],
  },
  {
    icon: "🌸",
    title: "2 триместр",
    text: "Первые шевеления, питание, движение, подготовка дома.",
    links: [
      { href: "/courses/mother/m-07", label: "Шевеления плода" },
      { href: "/products", label: "Что купить" },
    ],
  },
  {
    icon: "🧳",
    title: "3 триместр",
    text: "Выбор роддома, сумка, план родов и признаки начала.",
    links: [
      { href: "/hospitals", label: "Роддома на карте" },
      { href: "/checklist", label: "Чек-лист сумки" },
    ],
  },
  {
    icon: "👶",
    title: "Роды",
    text: "Когда ехать, что происходит в родзале, чем помогает папа.",
    links: [
      { href: "/courses/mother/m-11", label: "Когда ехать" },
      { href: "/courses/father/f-08", label: "Папа в роддоме" },
    ],
  },
  {
    icon: "🍼",
    title: "Первые месяцы",
    text: "Грудное вскармливание, восстановление, уход и сон малыша.",
    links: [
      { href: "/courses/mother/m-14", label: "Грудное вскармливание" },
      { href: "/help", label: "Тревожные симптомы" },
    ],
  },
];

export function HomeJourney() {
  return (
    <section className="journey">
      <div className="section-head">
        <p className="page-intro__eyebrow">Путь родителей</p>
        <h2>Всё по шагам — от планирования до первых месяцев</h2>
      </div>
      <ol className="journey-list">
        {STAGES.map((stage, i) => (
          <li key={stage.title} className="journey-step card">
            <span className="journey-step__num">{i + 1}</span>
            <span className="journey-step__icon" aria-hidden>{stage.icon}</span>
            <h3>{stage.title}</h3>
            <p className="muted">{stage.text}</p>
            <div className="journey-step__links">
              {stage.links.map((link) => (
                <Link key={link.href} href={link.href}>{link.label} →</Link>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
