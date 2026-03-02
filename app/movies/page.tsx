"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ImdbSearchItem } from "../lib/imdb";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { navLinks } from "../data/content";

export default function MoviesPage() {
  const currentYear = new Date().getFullYear();
  const [query, setQuery] = useState("Inception");
  const [submittedQuery, setSubmittedQuery] = useState("Inception");
  const [year, setYear] = useState<string>("");
  const [type, setType] = useState<"all" | "movie" | "series">("all");
  const [items, setItems] = useState<ImdbSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => Array.from({ length: 60 }, (_, i) => String(currentYear - i)), [currentYear]);

  const load = async (nextQuery: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ query: nextQuery });
      if (year) params.set("year", year);
      if (type !== "all") params.set("type", type);
      const res = await fetch(`/api/imdb/search?${params.toString()}`);
      const data = (await res.json()) as { items?: ImdbSearchItem[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Ошибка поиска");
      setItems(data.items ?? []);
    } catch (fetchError) {
      setItems([]);
      setError(fetchError instanceof Error ? fetchError.message : "Ошибка поиска");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    void load(submittedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />
      <main className="relative z-10 mx-auto max-w-6xl px-3 sm:px-5 pb-20 sm:pb-24 pt-8 sm:pt-10 space-y-5 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Каталог фильмов (IMDb)</h1>
        <p className="text-sm text-slate-300">Источник данных: IMDb через OMDb API.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query);
          void load(query);
        }}
        className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3 sm:p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Название фильма"
          className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
        />
        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
        >
          <option value="">Любой год</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as "all" | "movie" | "series")}
          className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
        >
          <option value="all">Фильмы и сериалы</option>
          <option value="movie">Только фильмы</option>
          <option value="series">Только сериалы</option>
        </select>
        <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">Найти</button>
      </form>

      {isLoading ? <p className="text-slate-300">Загружаем…</p> : null}
      {error ? <p className="text-rose-300">{error}</p> : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
          Нажмите «Найти», чтобы загрузить фильмы для запроса «{submittedQuery}».
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {items.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition hover:-translate-y-1"
          >
            <div className="relative aspect-[2/3]">
              <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
            </div>
            <div className="space-y-1 p-3">
              <p className="line-clamp-1 font-semibold text-white">{movie.title}</p>
              <p className="text-xs uppercase tracking-wide text-slate-300">
                {movie.year} • {movie.type}
              </p>
            </div>
          </Link>
        ))}
      </div>
      </main>
      <Footer />
    </div>
  );
}
