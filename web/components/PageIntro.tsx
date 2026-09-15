import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = {
  href: string;
  label: string;
};

type Props = {
  eyebrow?: string;
  title?: string;
  description?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
  size?: "default" | "compact" | "home";
};

export function PageIntro({
  eyebrow,
  title,
  description,
  crumbs,
  children,
  size = "default",
}: Props) {
  return (
    <section className={`page-intro page-intro--${size}`}>
      {crumbs?.length ? (
        <nav className="breadcrumbs" aria-label="Навигация">
          {crumbs.map((crumb, index) => (
            <span key={crumb.href} className="breadcrumbs__item">
              {index > 0 ? <span className="breadcrumbs__sep">/</span> : null}
              {index === crumbs.length - 1 ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <Link href={crumb.href}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      {eyebrow ? <p className="page-intro__eyebrow">{eyebrow}</p> : null}
      {title ? <h1 className="page-intro__title">{title}</h1> : null}
      {description ? <p className="page-intro__desc">{description}</p> : null}
      {children}
    </section>
  );
}
