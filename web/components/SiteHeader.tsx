"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { apiFetch } from "@/lib/api";
import {
  clearAuth,
  getStoredUser,
  getToken,
  type AuthUser,
} from "@/lib/auth-storage";

export function SiteHeader() {
  const pathname = usePathname();
  const { ui, format } = useLocale();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const LINKS = [
    { href: "/", label: ui.nav.home, match: (path: string) => path === "/" },
    {
      href: "/courses",
      label: ui.nav.courses,
      match: (path: string) => path.startsWith("/courses"),
    },
    {
      href: "/hospitals",
      label: ui.nav.hospitals,
      match: (path: string) => path.startsWith("/hospitals"),
    },
    {
      href: "/products",
      label: ui.nav.products,
      match: (path: string) => path.startsWith("/products"),
    },
    {
      href: "/help",
      label: ui.nav.help,
      match: (path: string) => path.startsWith("/help"),
    },
  ];

  useEffect(() => {
    const stored = getStoredUser();
    const token = getToken();
    if (!stored || !token) {
      return;
    }
    setUser(stored);
    apiFetch<AuthUser>("/api/v1/auth/me", { token })
      .then(setUser)
      .catch(() => clearAuth());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function logout() {
    clearAuth();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo">
          <span className="site-logo__mark" aria-hidden>
            ♡
          </span>
          <span>
            <strong>{ui.brand.title}</strong>
            <small>{ui.brand.tagline}</small>
          </span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`site-header__panel ${menuOpen ? "is-open" : ""}`}>
          <nav className="site-nav" aria-label="Main menu">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.match(pathname) ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="site-auth">
            <LanguageSwitcher />
            {user ? (
              <>
                <span className="site-auth__name">
                  {format(ui.nav.hello, { name: user.name })}
                </span>
                <button type="button" className="btn-text" onClick={logout}>
                  {ui.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">
                  {ui.nav.login}
                </Link>
                <Link href="/register" className="btn-primary btn-sm">
                  {ui.nav.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
