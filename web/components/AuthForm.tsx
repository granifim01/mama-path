"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { saveAuth, type AuthUser } from "@/lib/auth-storage";
import { syncProgressFromApi } from "@/lib/progress-storage";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path =
        mode === "register" ? "/api/v1/auth/register" : "/api/v1/auth/login";
      const body =
        mode === "register"
          ? { name, email, password }
          : { email, password };

      const tokenResponse = await apiFetch<{ access_token: string }>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const user = await apiFetch<AuthUser>("/api/v1/auth/me", {
        token: tokenResponse.access_token,
      });

      saveAuth(tokenResponse.access_token, user);
      await syncProgressFromApi();
      router.push("/courses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card auth-form" onSubmit={onSubmit}>
      {mode === "register" ? (
        <label>
          Как вас зовут?
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            placeholder="Айгуль"
            autoComplete="name"
          />
        </label>
      ) : null}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <label>
        Пароль
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          placeholder="Не меньше 6 символов"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading
          ? "Подождите..."
          : mode === "register"
            ? "Создать аккаунт"
            : "Войти"}
      </button>

      <p className="muted">
        {mode === "register" ? (
          <>
            Уже есть аккаунт? <Link href="/login">Войти</Link>
          </>
        ) : (
          <>
            Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
          </>
        )}
      </p>
    </form>
  );
}
