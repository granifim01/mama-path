import Link from "next/link";

const COLUMNS = [
  {
    title: "Учиться",
    links: [
      { href: "/courses/mother", label: "Курс для мамы" },
      { href: "/courses/father", label: "Курс для папы" },
      { href: "/tracker", label: "Календарь беременности" },
    ],
  },
  {
    title: "Готовиться",
    links: [
      { href: "/hospitals", label: "Роддома на карте" },
      { href: "/hospitals/compare", label: "Сравнить роддома" },
      { href: "/checklist", label: "Сумка в роддом" },
      { href: "/products", label: "Что купить" },
    ],
  },
  {
    title: "Помощь",
    links: [
      { href: "/help", label: "Проверить симптомы" },
      { href: "tel:103", label: "Скорая — 103" },
      { href: "tel:112", label: "Служба спасения — 112" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-logo__mark" aria-hidden>♡</span>
          <div>
            <strong>Mama Path</strong>
            <p className="muted">
              Помогаем готовиться к родам и первым месяцам с малышом в Казахстане.
            </p>
          </div>
        </div>
        <div className="site-footer__cols">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((link) =>
                link.href.startsWith("tel:") ? (
                  <a key={link.href} href={link.href}>{link.label}</a>
                ) : (
                  <Link key={link.href} href={link.href}>{link.label}</Link>
                ),
              )}
            </nav>
          ))}
        </div>
        <p className="site-footer__note muted">
          Информация на сайте носит образовательный характер и не заменяет консультацию врача.
          При угрозе жизни звоните <a href="tel:103">103</a>.
        </p>
      </div>
    </footer>
  );
}
