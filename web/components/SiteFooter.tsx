import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>Mama Path</strong>
          <p className="muted">
            Помогаем готовиться к родам и первым месяцам с малышом в Казахстане.
          </p>
        </div>
        <nav className="site-footer__links" aria-label="Дополнительные ссылки">
          <Link href="/courses">Курсы</Link>
          <Link href="/help">Срочная помощь</Link>
          <Link href="/hospitals/compare">Сравнить роддома</Link>
        </nav>
        <p className="site-footer__note muted">
          Информация на сайте не заменяет консультацию врача. При угрозе жизни
          звоните <a href="tel:103">103</a>.
        </p>
      </div>
    </footer>
  );
}
