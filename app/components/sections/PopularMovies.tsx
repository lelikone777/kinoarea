"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type PopularMoviesProps = {
  movies: Movie[];
};

const CARDS_PER_PAGE = 4;
const YEAR_RANGE = 40;

export function PopularMovies({ movies }: PopularMoviesProps) {
  const yearsRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [moviesState, setMoviesState] = useState<Movie[]>(movies);
  const [isLoadingYear, setIsLoadingYear] = useState(false);

  useEffect(() => {
    setMoviesState(movies);
  }, [movies]);

  const years = useMemo(() => {
    const set = new Set<number>();
    moviesState.forEach((movie) => {
      if (movie.year) set.add(movie.year);
    });
    if (set.size === 0) {
      const current = new Date().getFullYear();
      return Array.from({ length: YEAR_RANGE }, (_, index) => current - index);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [moviesState]);

  const filtered = useMemo(() => {
    if (selectedYear === "all") return moviesState;
    const list = moviesState.filter((movie) => movie.year === selectedYear);
    return list.length ? list : moviesState;
  }, [moviesState, selectedYear]);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const handleScroll = () => {
      const step = node.clientWidth || 1;
      const nextPage = Math.max(1, Math.round(node.scrollLeft / step) + 1);
      setPage(nextPage);
    };
    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const scrollByStep = (direction: "prev" | "next") => {
    const node = trackRef.current;
    if (!node) return;
    const step = node.clientWidth || 0;
    node.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  };

  const scrollYears = (direction: "prev" | "next") => {
    const node = yearsRef.current;
    if (!node) return;
    node.scrollBy({ left: direction === "next" ? 120 : -120, behavior: "smooth" });
  };

  const handleYearSelect = async (year: number | "all") => {
    setSelectedYear(year);
    setPage(1);

    if (year === "all") {
      setMoviesState(movies);
      trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    setIsLoadingYear(true);
    try {
      const response = await fetch(`/api/popular-movies?year=${year}&limit=40`);
      if (!response.ok) throw new Error("Failed to fetch movies by year");
      const data = (await response.json()) as { movies: Movie[] };
      const payload = Array.isArray(data.movies) ? data.movies : [];
      setMoviesState(payload.length ? payload : movies);
    } catch {
      setMoviesState(movies);
    } finally {
      setIsLoadingYear(false);
      trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
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
            <div ref={yearsRef} data-year-scroll className="flex max-w-[260px] items-center gap-2 overflow-x-auto pr-1">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`whitespace-nowrap rounded-full px-2 py-1 transition ${
                    selectedYear === year ? "bg-white/10 text-white ring-1 ring-white/10" : "hover:text-white"
                  }`}
                >
                  {year}
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
        <div className="absolute left-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-l from-slate-950 to-transparent" />
        <div ref={trackRef} data-main-scroll className="flex gap-4 overflow-x-auto scroll-smooth pr-4">
          {filtered.map((movie, index) => (
            <div
              key={`${movie.id ?? movie.title}-${movie.year ?? "na"}-${index}`}
              className={`min-w-[240px] max-w-[260px] flex-1 sm:min-w-[260px] ${movie.id ? "cursor-pointer" : ""}`}
            >
              <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-1 hover:border-white/20">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">{movie.genre}</p>
                  </div>
                  {movie.id ? <Link href={`/movie/${movie.id}`} className="absolute inset-0" aria-label={`Открыть фильм ${movie.title}`} /> : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-300">
          <button
            className="rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => scrollByStep("prev")}
            disabled={currentPage <= 1}
          >
            ←
          </button>
          <span>
            {currentPage}/{totalPages}
          </span>
          <button
            className="rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => scrollByStep("next")}
            disabled={currentPage >= totalPages}
          >
            →
          </button>
        </div>

        {isLoadingYear ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-sm text-white backdrop-blur-sm">
            Загружаем фильмы...
          </div>
        ) : null}
      </div>

      <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40">
        Смотреть все
        <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
      </button>
      <style jsx global>{`
        [data-year-scroll]::-webkit-scrollbar {
          height: 6px;
        }
        [data-year-scroll]::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 9999px;
        }
        [data-year-scroll]::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #38bdf8, #6366f1);
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
        }
        [data-year-scroll]::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #22d3ee, #818cf8);
        }
        [data-main-scroll]::-webkit-scrollbar {
          height: 10px;
        }
        [data-main-scroll]::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 9999px;
        }
        [data-main-scroll]::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #38bdf8, #6366f1);
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
        }
        [data-main-scroll]::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #22d3ee, #818cf8);
        }
      `}</style>
    </section>
  );
}
