"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type PopularMoviesProps = {
  movies: Movie[];
};

const CARDS_PER_PAGE = 4;
const YEAR_RANGE = 40; // сколько лет назад можно листать по умолчанию

export function PopularMovies({ movies }: PopularMoviesProps) {
  const scrollYearsRef = useRef<HTMLDivElement | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [moviesState, setMoviesState] = useState<Movie[]>(movies);
  const [isLoadingYear, setIsLoadingYear] = useState(false);

  useEffect(() => {
    setMoviesState(movies);
  }, [movies]);

  const years = useMemo(() => {
    const set = new Set<number>();
    moviesState.forEach((m) => {
      if (m.year) set.add(m.year);
    });
    if (set.size === 0) {
      const current = new Date().getFullYear();
      return Array.from({ length: YEAR_RANGE }, (_, i) => current - i);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [moviesState]);

  const filtered = useMemo(() => {
    if (selectedYear === "all") return moviesState;
    const pool = moviesState.filter((m) => m.year === selectedYear);
    return pool.length ? pool : moviesState;
  }, [moviesState, selectedYear]);

  const pages = useMemo(() => {
    const chunks: Movie[][] = [];
    for (let i = 0; i < filtered.length; i += CARDS_PER_PAGE) {
      chunks.push(filtered.slice(i, i + CARDS_PER_PAGE));
    }
    return chunks;
  }, [filtered]);

  const totalPages = Math.max(1, pages.length || 1);
  const currentPage = Math.min(page, totalPages);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  const scrollYears = (dir: "prev" | "next") => {
    const node = scrollYearsRef.current;
    if (!node) return;
    const delta = dir === "prev" ? -120 : 120;
    node.scrollBy({ left: delta, behavior: "smooth" });
  };

  const handleYearSelect = async (year: number | "all") => {
    setSelectedYear(year);
    setPage(1);
    if (year === "all") {
      setMoviesState(movies);
      return;
    }
    setIsLoadingYear(true);
    try {
      const res = await fetch(`/api/popular-movies?year=${year}&limit=40`);
      if (!res.ok) throw new Error("year load failed");
      const data = (await res.json()) as { movies: Movie[] };
      setMoviesState(data.movies);
    } catch {
      setMoviesState(movies);
    } finally {
      setIsLoadingYear(false);
    }
  };

  return (
    <section className="mt-16 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Популярные фильмы</h2>
          <div className="h-0.5 w-16 rounded-full bg-white/70" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button
            onClick={() => handleYearSelect("all")}
            className={`rounded-full px-2 py-1 transition ${
              selectedYear === "all" ? "bg-white/10 text-white ring-1 ring-white/10" : "hover:text-white"
            }`}
          >
            Все время
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollYears("prev")}
              className="rounded-full bg-white/5 px-2 py-1 text-white transition hover:bg-white/10"
            >
              ←
            </button>
            <div
              ref={scrollYearsRef}
              className="flex max-w-[260px] items-center gap-2 overflow-x-auto scrollbar-hide"
            >
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearSelect(y)}
                  className={`whitespace-nowrap rounded-full px-2 py-1 transition ${
                    selectedYear === y ? "bg-white/10 text-white ring-1 ring-white/10" : "hover:text-white"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollYears("next")}
              className="rounded-full bg-white/5 px-2 py-1 text-white transition hover:bg-white/10"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-4 shadow-xl shadow-indigo-500/15">
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }}
        >
          {pages.map((chunk, idx) => (
            <div
              key={idx}
              className="grid min-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {chunk.map((movie) => (
                <div
                  key={movie.title + movie.year}
                  className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={movie.image}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                    {movie.tag ? (
                      <span className="absolute left-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {movie.tag}
                      </span>
                    ) : null}
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950 shadow">
                      <StarIcon className="h-4 w-4 text-slate-900" />
                      {movie.rating.toFixed(1)}
                    </span>
                    <div className="absolute inset-x-3 bottom-3 space-y-2">
                      <p className="text-base font-bold leading-6 text-white">{movie.title}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">
                        {movie.genre}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-300">
          <button
            className="rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ←
          </button>
          <span>
            {currentPage}/{Math.max(1, totalPages)}
          </span>
          <button
            className="rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>

        {isLoadingYear ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-sm text-white backdrop-blur-sm">
            Загружаем фильмы…
          </div>
        ) : null}
      </div>

      <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40">
        Смотреть все
        <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
      </button>
    </section>
  );
}
