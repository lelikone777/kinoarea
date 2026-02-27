"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";
import { useUiDictionary } from "@/app/hooks/useUiDictionary";
import { FilterWidgetTagCloud } from "../ui/filters/FilterWidget";

type NowPlayingProps = {
  movies: Movie[];
  filters: string[];
};

const NOW_FILTER_QUERY_KEY = "nowFilter";

type FilterOption = {
  value: string;
  label: string;
};

export function NowPlaying({ movies, filters }: NowPlayingProps) {
  const { dictionary } = useUiDictionary();
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

  const filterOptions = useMemo<FilterOption[]>(() => {
    const builtIn: FilterOption[] = [
      { value: "premieres", label: premieresFilter },
      { value: "popular", label: popularFilter },
    ];
    const genres = genreFilters.map((genre) => ({
      value: `genre:${normalize(genre)}`,
      label: genre,
    }));
    return [...builtIn, ...genres];
  }, [genreFilters, popularFilter, premieresFilter]);

  const [activeFilter, setActiveFilter] = useState<string>("premieres");
  const effectiveActiveFilter = filterOptions.some((option) => option.value === activeFilter)
    ? activeFilter
    : (filterOptions[0]?.value ?? "premieres");
  const filterTabs = filterOptions;

  useEffect(() => {
    const applyFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlFilter = params.get(NOW_FILTER_QUERY_KEY);
      setActiveFilter(urlFilter ?? (filterOptions[0]?.value ?? "premieres"));
    };

    applyFromUrl();
    window.addEventListener("popstate", applyFromUrl);
    return () => window.removeEventListener("popstate", applyFromUrl);
  }, [filterOptions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (effectiveActiveFilter === "premieres") {
      params.delete(NOW_FILTER_QUERY_KEY);
    } else {
      params.set(NOW_FILTER_QUERY_KEY, effectiveActiveFilter);
    }

    const nextSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");
    if (nextSearch === currentSearch) {
      return;
    }

    const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [effectiveActiveFilter]);

  const filteredMovies = useMemo(() => {
    if (effectiveActiveFilter === "premieres") {
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

    if (effectiveActiveFilter === "popular") {
      return [...movies].sort((a, b) => {
        const bScore = (b.popularity ?? 0) * 100 + (b.voteCount ?? 0) + b.rating * 10;
        const aScore = (a.popularity ?? 0) * 100 + (a.voteCount ?? 0) + a.rating * 10;
        return bScore - aScore;
      });
    }

    const activeGenre = effectiveActiveFilter.startsWith("genre:")
      ? effectiveActiveFilter.slice("genre:".length)
      : "";
    if (!activeGenre) {
      return movies;
    }

    return movies.filter((movie) =>
      extractGenres(movie).some((genre) => normalize(genre) === activeGenre),
    );
  }, [effectiveActiveFilter, movies]);

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{dictionary.nowPlaying.subtitle}</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{dictionary.nowPlaying.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {dictionary.nowPlaying.description}
          </p>
        </div>
        <Link
          href="/movies?sortBy=now_playing.desc"
          className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
        >
          {dictionary.nowPlaying.fullList}
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-4">
        <FilterWidgetTagCloud
          value={effectiveActiveFilter}
          onChange={setActiveFilter}
          options={filterTabs}
          className="px-2"
        />
      </div>

      {filteredMovies.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          {dictionary.nowPlaying.noResults}
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
                        {dictionary.nowPlaying.details}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-bold leading-6 text-white">{movie.title}</p>
                    <p className="text-sm text-slate-300">{movie.genre}</p>
                  </div>
                  {movie.id ? (
                      <Link
                        href={`/movies/${movie.id}`}
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
