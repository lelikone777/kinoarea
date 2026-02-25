"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type NowPlayingProps = {
  movies: Movie[];
  filters: string[];
};

export function NowPlaying({ movies, filters }: NowPlayingProps) {
  const premieresFilter = filters[0] ?? "Премьеры";
  const popularFilter = filters[1] ?? "Популярные";

  const normalize = (value: string) => value.trim().toLocaleLowerCase();

  const extractGenres = (movie: Movie): string[] => {
    if (!movie.genre) {
      return [];
    }
    if (movie.genre.includes("•")) {
      return [movie.genre.split("•")[0]?.trim()].filter(Boolean) as string[];
    }
    return movie.genre
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  };

  const genreFilters = useMemo(() => {
    const seen = new Set<string>();
    const genres: string[] = [];
    for (const movie of movies) {
      for (const genre of extractGenres(movie)) {
        const key = normalize(genre);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        genres.push(genre);
      }
    }
    return genres;
  }, [movies]);

  const filterChips = useMemo(
    () => [premieresFilter, popularFilter, ...genreFilters],
    [genreFilters, popularFilter, premieresFilter],
  );

  const [activeFilter, setActiveFilter] = useState(filterChips[0] ?? premieresFilter);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  const desktopFilterRef = useRef<HTMLDivElement | null>(null);
  const effectiveActiveFilter = filterChips.includes(activeFilter) ? activeFilter : (filterChips[0] ?? premieresFilter);

  useEffect(() => {
    if (!isDesktopFilterOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!desktopFilterRef.current) {
        return;
      }
      if (!desktopFilterRef.current.contains(event.target as Node)) {
        setIsDesktopFilterOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDesktopFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDesktopFilterOpen]);

  const filteredMovies = useMemo(() => {
    if (effectiveActiveFilter === premieresFilter) {
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
      if (fresh.length) {
        return fresh;
      }
      const byBadge = movies.filter((movie) => Boolean(movie.badge));
      return byBadge.length ? byBadge : movies.slice(0, 6);
    }

    if (effectiveActiveFilter === popularFilter) {
      return [...movies].sort((a, b) => {
        const bScore = (b.popularity ?? 0) * 100 + (b.voteCount ?? 0) + b.rating * 10;
        const aScore = (a.popularity ?? 0) * 100 + (a.voteCount ?? 0) + a.rating * 10;
        return bScore - aScore;
      });
    }

    return movies.filter((movie) =>
      extractGenres(movie).some((genre) => normalize(genre) === normalize(effectiveActiveFilter)),
    );
  }, [effectiveActiveFilter, movies, popularFilter, premieresFilter]);

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

      <div className="mt-4 hidden lg:flex">
        <div ref={desktopFilterRef} className="relative w-full max-w-sm">
          <button
            type="button"
            onClick={() => setIsDesktopFilterOpen((prev) => !prev)}
            aria-expanded={isDesktopFilterOpen}
            aria-haspopup="listbox"
            className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-sky-300/50 hover:bg-slate-900"
          >
            <span>{effectiveActiveFilter}</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`h-4 w-4 text-slate-300 transition ${isDesktopFilterOpen ? "rotate-180" : ""}`}
            >
              <path fill="currentColor" d="M6.7 8.8a1 1 0 0 1 1.4 0L12 12.7l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.2a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>

          {isDesktopFilterOpen ? (
            <div
              role="listbox"
              className="hide-scrollbar absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl shadow-sky-900/20 backdrop-blur"
            >
              {filterChips.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter);
                    setIsDesktopFilterOpen(false);
                  }}
                  className={`mb-1 flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition last:mb-0 ${
                    effectiveActiveFilter === filter
                      ? "bg-sky-400 text-slate-950"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <span>{filter}</span>
                  {effectiveActiveFilter === filter ? (
                    <span className="text-xs font-bold">Выбрано</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
            style={{ background: "linear-gradient(to right, var(--color-background) 30%, rgba(11, 18, 32, 0))" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
            style={{ background: "linear-gradient(to left, var(--color-background) 30%, rgba(11, 18, 32, 0))" }}
          />
          <div className="hide-scrollbar flex touch-pan-x gap-2 overflow-x-auto px-2 pb-2">
            {filterChips.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                  effectiveActiveFilter === filter
                    ? "bg-sky-400 text-slate-950"
                    : "bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
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
