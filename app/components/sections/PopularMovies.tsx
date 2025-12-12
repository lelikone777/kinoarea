"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type PopularMoviesProps = {
  movies: Movie[];
};

const BATCH = 12;
const MAX_ITEMS = 60;

export function PopularMovies({ movies }: PopularMoviesProps) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(BATCH, movies.length));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(BATCH, movies.length));
  }, [movies]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH, Math.min(movies.length, MAX_ITEMS)));
        }
      },
      { root: null, rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [movies.length]);

  const visibleMovies = movies.slice(0, visibleCount);

  return (
    <section className="mt-16 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Популярные фильмы</h2>
          <div className="h-0.5 w-16 rounded-full bg-white/70" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button className="rounded-full px-2 py-1 transition hover:text-white">Все время</button>
          <button className="rounded-full px-2 py-1 transition hover:text-white">2025</button>
          <button className="rounded-full bg-white/10 px-2 py-1 text-white ring-1 ring-white/10">2024</button>
          <button className="rounded-full px-2 py-1 transition hover:text-white">2019</button>
          <button className="rounded-full px-2 py-1 transition hover:text-white">2018</button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-4 shadow-xl shadow-indigo-500/15">
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory">
          {visibleMovies.map((movie) => (
            <div
              key={movie.title}
              className="group relative w-[220px] flex-shrink-0 snap-start overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="relative aspect-[2/3]">
                <Image
                  src={movie.image}
                  alt={movie.title}
                  fill
                  sizes="220px"
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
          <div ref={sentinelRef} className="h-px w-px" />
        </div>
      </div>

      <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40">
        Смотреть все
        <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
      </button>
    </section>
  );
}
