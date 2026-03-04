"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getApiErrorMessage } from "@/app/lib/auth/client-error";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname, password, confirmPassword }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(getApiErrorMessage(payload, "Registration failed"));
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Не удалось зарегистрироваться");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">Регистрация</h1>
        <p className="mt-1 text-sm text-slate-300">Создайте аккаунт</p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="text"
            placeholder="Никнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />

          {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-70"
          >
            {isSubmitting ? "Создаем..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          Уже есть аккаунт?{" "}
          <Link href="/auth/login" className="font-semibold text-sky-300 hover:text-sky-200">
            Войти
          </Link>
        </p>
      </section>
    </main>
  );
}

