"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type NewsletterPoster = {
  id?: number;
  title: string;
  image: string;
};

type NewsletterSectionProps = {
  posters?: NewsletterPoster[];
};

const FALLBACK_POSTERS: NewsletterPoster[] = [
  {
    title: "Джокер",
    image: "https://image.tmdb.org/t/p/w300/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
  },
  {
    title: "Джокер, альтернативный постер",
    image: "https://image.tmdb.org/t/p/w300/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },
  {
    title: "Ford против Ferrari",
    image: "https://image.tmdb.org/t/p/w300/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
  },
];

export function NewsletterSection({ posters }: NewsletterSectionProps) {
  const router = useRouter();
  const posterItems = (posters?.length ? posters : FALLBACK_POSTERS).slice(0, 3);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      setError("Введите корректный e-mail");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        setError("Что-то пошло не так");
        return;
      }

      router.push(`/subscription/success?email=${encodeURIComponent(normalizedEmail)}`);
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-16 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-blue-800 via-indigo-700 to-sky-500 p-8 shadow-2xl shadow-blue-500/30">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Подборка недели</p>
          <h3 className="text-3xl font-extrabold text-white">Подписка на e-mail с лучшими трейлерами и премьерами</h3>
          <p className="max-w-xl text-sm text-sky-100">
            Получайте подборки фильмов, расписание премьер и материалы редакции. Только полезные письма без спама.
          </p>
          <form className="space-y-2" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Ваш e-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error ? "true" : "false"}
                className="w-full rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-sm font-semibold text-white placeholder:text-sky-100/70 outline-none transition focus:border-white focus:bg-white/20"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Загрузка..." : "Подписаться"}
              </button>
            </div>
            {error ? <p className="text-sm font-semibold text-rose-100">{error}</p> : null}
          </form>
          <p className="text-xs text-sky-100/70">
            Нажимая кнопку, вы соглашаетесь на обработку данных и получение писем о новинках.
          </p>
        </div>
        <div className="relative hidden items-center justify-center lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative flex gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
            {posterItems.map((poster, index) => (
              <div key={`${poster.id ?? poster.title}-${index}`} className="relative h-32 w-20 overflow-hidden rounded-xl">
                <Image src={poster.image} alt={poster.title} fill sizes="120px" className="h-full w-full object-cover" />
                {poster.id ? <Link href={`/movies/${poster.id}`} className="absolute inset-0" aria-label={`Open ${poster.title}`} /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
