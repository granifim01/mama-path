import { AuthForm } from "@/components/AuthForm";
import { PageIntro } from "@/components/PageIntro";

export default function LoginPage() {
  return (
    <main className="shell auth-shell">
      <PageIntro
        size="compact"
        title="Вход"
        description="Войдите, чтобы сохранять прогресс по курсам."
      />
      <AuthForm mode="login" />
    </main>
  );
}
