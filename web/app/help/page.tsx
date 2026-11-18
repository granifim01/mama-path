import { PageIntro } from "@/components/PageIntro";
import { TriageAssistant } from "@/components/TriageAssistant";

const NUMBERS = [
  { num: "103", label: "Скорая медицинская помощь", main: true },
  { num: "112", label: "Единая служба спасения (с мобильного, без SIM)" },
  { num: "1406", label: "Контакт-центр Минздрава: вопросы по ОСМС и прикреплению" },
];

const RED_FLAGS = {
  pregnancy: [
    "Кровотечение из влагалища в любом объёме",
    "Подтекание или отхождение вод до 37 недель",
    "Малыш шевелится заметно меньше или перестал",
    "Сильная головная боль, «мушки», резкие отёки лица и рук",
    "Боль в животе, которая не проходит в покое",
    "Температура 38 °C и выше",
  ],
  baby: [
    "Ребёнку до 3 месяцев и температура 38 °C и выше",
    "Посинение губ, паузы в дыхании, втяжение межрёберий",
    "Вялость, не просыпается на кормление, не берёт грудь",
    "Нет мокрых подгузников 6–8 часов",
    "Рвота фонтаном несколько раз подряд",
    "Выбухающий родничок или судороги",
  ],
};

export default function HelpPage() {
  return (
    <main className="shell">
      <PageIntro
        eyebrow="Бесплатно и без регистрации"
        title="Срочная помощь"
        description="Опишите ситуацию простыми словами — подскажем, насколько это срочно и что делать дальше. Это не диагноз и не замена врача."
      />

      <div className="help-layout">
        <TriageAssistant />

        <aside className="help-aside">
          <section className="card emergency-card">
            <h2>Экстренные номера</h2>
            <ul className="phone-list">
              {NUMBERS.map((n) => (
                <li key={n.num}>
                  <a href={`tel:${n.num}`} className={n.main ? "phone-num phone-num--main" : "phone-num"}>
                    {n.num}
                  </a>
                  <span>{n.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card redflags">
            <h2>Когда сразу звонить 103</h2>
            <h3>🤰 Во время беременности</h3>
            <ul>
              {RED_FLAGS.pregnancy.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <h3>👶 У новорождённого</h3>
            <ul>
              {RED_FLAGS.baby.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
