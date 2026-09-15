import { AuthForm } from "@/components/AuthForm";
import { PageIntro } from "@/components/PageIntro";

export default function RegisterPage() {
  return (
    <main className="shell auth-shell">
      <PageIntro
        size="compact"
        title="Регистрация"
        description="Бесплатный аккаунт — прогресс курсов сохранится и не потеряется."
      />
      <AuthForm mode="register" />
    </main>
  );
}
