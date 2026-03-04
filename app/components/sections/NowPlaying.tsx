"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, StarIcon } from "../icons";
import { LinkButton } from "../ui/Button";
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

const CAROUSEL_GAP_PX = 16; // gap-4

export function NowPlaying({ movies, filters }: NowPlayingProps) {
  const { dictionary } = useUiDictionary();
  const premieresFilter = filters[0] ?? "Премьеры";
  const popularFilter = filters[1] ?? "Популярные";
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [page, setPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(4);

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
  const handleFilterChange = (nextValue: string) => {
    setActiveFilter(nextValue);
    setPage(1);
  };

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

  useEffect(() => {
    cardRefs.current = [];
    requestAnimationFrame(() => {
      cardRefs.current[0]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    });
  }, [effectiveActiveFilter]);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const computeCardsPerPage = () => {
      const firstCard = cardRefs.current.find(Boolean);
      const cardWidth = firstCard?.offsetWidth ?? 0;
      if (!cardWidth) {
        setCardsPerPage(1);
        return;
      }
      const visible = Math.max(1, Math.floor(node.clientWidth / (cardWidth + CAROUSEL_GAP_PX)));
      setCardsPerPage(visible);
    };

    computeCardsPerPage();

    const ro = new ResizeObserver(() => computeCardsPerPage());
    ro.observe(node);
    return () => ro.disconnect();
  }, [filteredMovies.length]);

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / cardsPerPage));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const indexAttr = (entry.target as HTMLElement).dataset.index;
          if (indexAttr === undefined) continue;
          const index = Number(indexAttr);
          if (Number.isNaN(index)) continue;
          if (!best || entry.intersectionRatio > best.ratio || (entry.intersectionRatio === best.ratio && index < best.index)) {
            best = { index, ratio: entry.intersectionRatio };
          }
        }
        if (!best) return;
        const nextPage = Math.max(1, Math.floor(best.index / cardsPerPage) + 1);
        setPage(nextPage);
      },
      { root: node, threshold: [0.3, 0.6, 1] }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [filteredMovies.length, cardsPerPage]);

  const scrollToPage = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(nextPage, totalPages));
    const targetIndex = (safePage - 1) * cardsPerPage;
    const targetCard = cardRefs.current[targetIndex];
    if (!targetCard) return;
    setPage(safePage);
    targetCard.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

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
        <LinkButton
          href="/movies?sortBy=now_playing.desc"
          variant="sectionListLink"
        >
          {dictionary.nowPlaying.fullList}
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </LinkButton>
      </div>

      <div className="mt-4">
        <FilterWidgetTagCloud
          value={effectiveActiveFilter}
          onChange={handleFilterChange}
          options={filterTabs}
          className="px-2"
        />
      </div>

      {filteredMovies.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          {dictionary.nowPlaying.noResults}
        </div>
      ) : (
        <div className="mt-6">
          <div className="relative overflow-visible rounded-3xl bg-slate-900/60 p-4 shadow-xl shadow-indigo-500/15">
            <div className="absolute left-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="absolute right-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-l from-slate-950 to-transparent" />

            <div
              ref={trackRef}
              data-now-track
              className="now-track-mask flex gap-4 overflow-x-auto scroll-smooth pr-4 snap-x snap-mandatory flex-nowrap touch-pan-x"
            >
              {filteredMovies.map((movie, index) => {
                const isClickable = Boolean(movie.id);

                return (
                  <div
                    key={`${movie.id ?? movie.title}-${index}`}
                    data-index={index}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className={`min-w-[240px] max-w-[260px] snap-start shrink-0 sm:min-w-[260px] ${isClickable ? "cursor-pointer" : ""}`}
                  >
                    <div className="group relative overflow-hidden rounded-2xl bg-white/5 shadow-lg shadow-sky-500/10">
                      <div className="relative aspect-[2/3]">
                        <Image
                          src={movie.image}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 1024px) 50vw, 23vw"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          priority={index === 0}
                          fetchPriority={index === 0 ? "high" : "auto"}
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
                  </div>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-0">
              <button
                className="pointer-events-auto -ml-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-slate-950/95 text-lg font-bold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-105 hover:border-cyan-300 hover:bg-slate-900 disabled:opacity-40"
                onClick={() => scrollToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Предыдущая страница"
              >
                ←
              </button>
              <button
                className="pointer-events-auto -mr-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-slate-950/95 text-lg font-bold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-105 hover:border-cyan-300 hover:bg-slate-900 disabled:opacity-40"
                onClick={() => scrollToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Следующая страница"
              >
                →
              </button>
            </div>
          </div>

          <style jsx global>{`
            .now-track-mask {
              mask-image: linear-gradient(90deg, transparent 0, black 48px, black calc(100% - 48px), transparent 100%);
              -webkit-mask-image: linear-gradient(90deg, transparent 0, black 48px, black calc(100% - 48px), transparent 100%);
            }
            [data-now-track]::-webkit-scrollbar {
              height: 10px;
            }
            [data-now-track]::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.04);
              border-radius: 9999px;
            }
            [data-now-track]::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #38bdf8, #6366f1);
              border-radius: 9999px;
              border: 1px solid rgba(255, 255, 255, 0.35);
            }
            [data-now-track]::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #22d3ee, #818cf8);
            }
          `}</style>
        </div>
      )}
    </section>
  );
}
