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
  const yearAbortRef = useRef<AbortController | null>(null);
  const yearButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [activeYearIndex, setActiveYearIndex] = useState(-1);
  const [page, setPage] = useState(1);
  const [moviesState, setMoviesState] = useState<Movie[]>(movies);
  const [isLoadingYear, setIsLoadingYear] = useState(false);

  useEffect(() => {
    setMoviesState(movies);
  }, [movies]);

  useEffect(() => {
    return () => yearAbortRef.current?.abort();
  }, []);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: YEAR_RANGE }, (_, index) => current - index);
  }, []);

  const filtered = useMemo(() => {
    if (selectedYear === "all") return moviesState;
    return moviesState.filter((movie) => movie.year === selectedYear);
  }, [moviesState, selectedYear]);

  useEffect(() => {
    cardRefs.current = [];
  }, [filtered.length]);

  useEffect(() => {
    if (selectedYear === "all") {
      setActiveYearIndex(-1);
      return;
    }
    const index = years.findIndex((value) => value === selectedYear);
    setActiveYearIndex(index >= 0 ? index : -1);
  }, [selectedYear, years]);

  useEffect(() => {
    const target = yearButtonsRef.current[activeYearIndex];
    target?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeYearIndex]);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) return;
          const indexAttr = (entry.target as HTMLElement).dataset.index;
          if (indexAttr === undefined) return;
          const index = Number(indexAttr);
          if (Number.isNaN(index)) return;
          if (!best || entry.intersectionRatio > best.ratio || (entry.intersectionRatio === best.ratio && index < best.index)) {
            best = { index, ratio: entry.intersectionRatio };
          }
        }
        if (!best) return;
        const nextPage = Math.max(1, Math.floor(best.index / CARDS_PER_PAGE) + 1);
        setPage(nextPage);
      },
      { root: node, threshold: [0.3, 0.6, 1] }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const scrollByStep = (direction: "prev" | "next") => {
    const totalPagesLocal = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
    const nextPage = direction === "next" ? Math.min(totalPagesLocal, page + 1) : Math.max(1, page - 1);
    const targetIndex = (nextPage - 1) * CARDS_PER_PAGE;
    const targetCard = cardRefs.current[targetIndex];
    if (!targetCard) return;
    targetCard.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  const scrollYears = (direction: "prev" | "next") => {
    const total = years.length;
    if (!total) return;
    let nextIndex = activeYearIndex;
    if (direction === "next") {
      nextIndex = activeYearIndex < 0 ? 0 : Math.min(total - 1, activeYearIndex + 1);
    } else {
      if (activeYearIndex < 0) return;
      nextIndex = activeYearIndex - 1;
      if (nextIndex < 0) {
        handleYearSelect("all");
        return;
      }
    }
    const year = years[nextIndex];
    if (year === undefined) return;
    setActiveYearIndex(nextIndex);
    handleYearSelect(year);
    yearButtonsRef.current[nextIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const handleYearSelect = async (year: number | "all") => {
    setSelectedYear(year);
    setPage(1);

    yearAbortRef.current?.abort();

    if (year === "all") {
      setMoviesState(movies);
      setIsLoadingYear(false);
      trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    setIsLoadingYear(true);
    const controller = new AbortController();
    yearAbortRef.current = controller;
    try {
      const response = await fetch(`/api/popular-movies?year=${year}&limit=60`, { signal: controller.signal });
      if (!response.ok) throw new Error("Failed to fetch movies by year");
      const data = (await response.json()) as { movies: Movie[] };
      const payload = Array.isArray(data.movies) ? data.movies : [];
      if (yearAbortRef.current === controller) {
        setMoviesState(payload);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setMoviesState(movies);
    } finally {
      if (yearAbortRef.current === controller) {
        setIsLoadingYear(false);
        yearAbortRef.current = null;
        trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <section className="mt-16 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Популярные фильмы</h2>
          <div className="h-0.5 w-16 rounded-full bg-white/70" />
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
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
              aria-label="Прокрутить годы влево"
            >
              ←
            </button>
            <div
              ref={yearsRef}
              data-year-scroll
              className="flex max-w-[260px] flex-nowrap items-center gap-2 overflow-x-auto pr-1 scroll-smooth"
            >
              {years.map((year, index) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  ref={(el) => {
                    yearButtonsRef.current[index] = el;
                  }}
                  className={`whitespace-nowrap rounded-full px-2 py-1 transition shrink-0 ${
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
              aria-label="Прокрутить годы вправо"
            >
              →
            </button>
          </div>
          <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40">
            Смотреть все
            <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-4 shadow-xl shadow-indigo-500/15"
        aria-busy={isLoadingYear}
      >
        <div className="absolute left-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-l from-slate-950 to-transparent" />
        <div
          ref={trackRef}
          data-main-scroll
          className="popular-track-mask flex gap-4 overflow-x-auto scroll-smooth pr-4 snap-x snap-mandatory flex-nowrap touch-pan-x"
        >
          {filtered.length === 0 ? (
            <div className="flex min-h-[280px] min-w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 text-center text-sm text-slate-300">
              В этом году нет популярных фильмов. Попробуйте другой год.
            </div>
          ) : (
            filtered.map((movie, index) => (
              <div
                key={`${movie.id ?? movie.title}-${movie.year ?? "na"}-${index}`}
                data-card
                data-index={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`min-w-[240px] max-w-[260px] snap-start shrink-0 sm:min-w-[260px] ${movie.id ? "cursor-pointer" : ""}`}
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
                      <span className="absolute left-3 top-3 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100 backdrop-blur">
                        {movie.tag}
                      </span>
                    ) : null}
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950 shadow ring-1 ring-emerald-200/60">
                      <StarIcon className="h-4 w-4 text-slate-900" />
                      {movie.rating.toFixed(1)}
                    </span>
                    <div className="absolute inset-x-3 bottom-3 space-y-2">
                      <p className="popular-clamp-title text-base font-bold leading-6 text-white">{movie.title}</p>
                      <p className="popular-clamp-genre text-xs font-semibold uppercase tracking-[0.12em] text-amber-200/90">
                        {movie.genre}
                      </p>
                    </div>
                    {movie.id ? <Link href={`/movies/${movie.id}`} className="absolute inset-0" aria-label={`Открыть фильм ${movie.title}`} /> : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-300">
          <button
            className="rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => scrollByStep("prev")}
            disabled={currentPage <= 1}
            aria-label="Предыдущая страница"
          >
            ←
          </button>
          <span aria-live="polite">
            {currentPage}/{totalPages}
          </span>
          <button
            className="rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => scrollByStep("next")}
            disabled={currentPage >= totalPages}
            aria-label="Следующая страница"
          >
            →
          </button>
        </div>

        {isLoadingYear ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-sm text-white backdrop-blur-sm pointer-events-auto">
            Загружаем фильмы...
          </div>
        ) : null}
      </div>

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
        .popular-clamp-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .popular-clamp-genre {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .popular-track-mask {
          mask-image: linear-gradient(90deg, transparent 0, black 48px, black calc(100% - 48px), transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0, black 48px, black calc(100% - 48px), transparent 100%);
        }
      `}</style>
    </section>
  );
}

