"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type NowPlayingProps = {
  movies: Movie[];
  filters: string[];
};

export function NowPlaying({ movies, filters }: NowPlayingProps) {
  const defaultFilter = filters[0] ?? "Все фильмы";
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  const [allFilter, freshFilter, ratedFilter, popularFilter, actionFilter] = filters;

  const filteredMovies = useMemo(() => {
    if (!activeFilter || activeFilter === allFilter) {
      return movies;
    }

    if (activeFilter === freshFilter) {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const releaseTimes = movies
        .map((movie) => (movie.releaseDate ? new Date(movie.releaseDate).getTime() : Number.NaN))
        .filter((time) => Number.isFinite(time));
      const latestRelease = releaseTimes.length ? Math.max(...releaseTimes) : Number.NaN;
      if (!Number.isFinite(latestRelease)) {
        return movies.slice(0, 6);
      }
      const fresh = movies.filter((movie) => {
        if (!movie.releaseDate) {
          return false;
        }
        const releaseTime = new Date(movie.releaseDate).getTime();
        if (!Number.isFinite(releaseTime)) {
          return false;
        }
        return latestRelease >= releaseTime && latestRelease - releaseTime <= thirtyDaysMs;
      });
      return fresh.length ? fresh : movies.slice(0, 6);
    }

    if (activeFilter === ratedFilter) {
      return movies.filter((movie) => movie.rating >= 7);
    }

    if (activeFilter === popularFilter) {
      return [...movies].sort((a, b) => {
        const bScore = (b.popularity ?? 0) * 100 + (b.voteCount ?? 0) + b.rating * 10;
        const aScore = (a.popularity ?? 0) * 100 + (a.voteCount ?? 0) + a.rating * 10;
        return bScore - aScore;
      });
    }

    if (activeFilter === actionFilter) {
      return movies.filter(
        (movie) =>
          movie.genreIds?.includes(28) ||
          movie.genre.toLocaleLowerCase().includes("боевик") ||
          movie.genre.toLocaleLowerCase().includes("action"),
      );
    }

    return movies;
  }, [actionFilter, activeFilter, allFilter, freshFilter, movies, popularFilter, ratedFilter]);

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Горячие сеансы сегодня</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Сейчас в прокате</h1>
          <p className="mt-1 text-sm text-slate-400">
            Смотрите свежие премьеры и выбирайте фильмы по релизу, рейтингу, популярности и жанру.
          </p>
        </div>
        <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40">
          Полный список
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeFilter === filter
                ? "bg-sky-400 text-slate-950"
                : "bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredMovies.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          По выбранному фильтру фильмы пока не найдены.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredMovies.map((movie, index) => {
            const isNinth = index === 8;
            const isClickable = Boolean(movie.id);

            return (
              <div
                key={`${movie.id ?? movie.title}-${index}`}
                className={`group relative overflow-hidden rounded-2xl bg-white/5 shadow-lg shadow-sky-500/10 ${
                  isNinth ? "hidden sm:block lg:hidden" : ""
                } ${isClickable ? "cursor-pointer" : ""}`}
              >
                <div className="relative aspect-[2/3]">
                  <Image
                    src={movie.image}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 23vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
                    {movie.badge ? (
                      <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950 shadow">
                        {movie.badge}
                      </span>
                    ) : null}
                    {movie.tag ? (
                      <span className="cursor-pointer rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                        {movie.tag}
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
                        <span className="inline-flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-amber-400" />
                          {movie.rating.toFixed(1)}
                        </span>
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                        Подробнее
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-bold leading-6 text-white">{movie.title}</p>
                    <p className="text-sm text-slate-300">{movie.genre}</p>
                  </div>
                  {movie.id ? (
                    <Link
                      href={`/movie/${movie.id}`}
                      className="absolute inset-0 z-10"
                      aria-label={`Открыть фильм ${movie.title}`}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
