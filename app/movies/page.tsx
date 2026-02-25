"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { navLinks } from "../data/content";

type CatalogMovie = {
  id: number;
  title: string;
  year?: number;
  type: "movie";
  poster: string;
  rating: number;
  overview: string;
  genres: string[];
};

type Genre = {
  id: number;
  name: string;
};

type MoviesApiResponse = {
  items: CatalogMovie[];
  page: number;
  totalPages: number;
  totalResults: number;
  genres: Genre[];
  error?: string;
};

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top rated" },
  { value: "release_date.desc", label: "Newest" },
  { value: "revenue.desc", label: "Top grossing" },
] as const;

export default function MoviesPage() {
  const currentYear = new Date().getFullYear();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [year, setYear] = useState<string>("");
  const [genreId, setGenreId] = useState<string>("");
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("popularity.desc");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<CatalogMovie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(
    () => Array.from({ length: 80 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (submittedQuery.trim()) params.set("query", submittedQuery.trim());
        if (year) params.set("year", year);
        if (genreId) params.set("genreId", genreId);
        params.set("sortBy", sortBy);
        params.set("page", String(page));

        const response = await fetch(`/api/tmdb/movies?${params.toString()}`);
        const data = (await response.json()) as MoviesApiResponse;
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch TMDB catalog");
        }

        if (!isMounted) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setGenres(Array.isArray(data.genres) ? data.genres : []);
        setTotalPages(Math.max(1, Number(data.totalPages) || 1));
        setTotalResults(Number(data.totalResults) || 0);
      } catch (loadError) {
        if (!isMounted) return;
        setItems([]);
        setError(loadError instanceof Error ? loadError.message : "Failed to load movies");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadMovies();

    return () => {
      isMounted = false;
    };
  }, [submittedQuery, year, genreId, sortBy, page]);

  const hasFilters = Boolean(submittedQuery.trim() || year || genreId);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto max-w-6xl space-y-6 px-5 pb-24 pt-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">TMDB Movie Catalog</h1>
          <p className="text-sm text-slate-300">
            Search and filter movies using The Movie Database API.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSubmittedQuery(query);
          }}
          className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Movie title"
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
          />

          <select
            value={year}
            onChange={(event) => {
              setPage(1);
              setYear(event.target.value);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
          >
            <option value="">Any year</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={genreId}
            onChange={(event) => {
              setPage(1);
              setGenreId(event.target.value);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
          >
            <option value="">All genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={String(genre.id)}>
                {genre.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => {
              setPage(1);
              setSortBy(event.target.value as (typeof SORT_OPTIONS)[number]["value"]);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            Search
          </button>
        </form>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <p>
            {isLoading ? "Loading..." : `${totalResults} results`}
          </p>
          <p>Page {page} / {totalPages}</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-rose-200">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
            {hasFilters
              ? "No movies found for current filters."
              : "No movies available right now."}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition hover:-translate-y-1"
            >
              <div className="relative aspect-[2/3]">
                <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
              </div>

              <div className="space-y-2 p-3">
                <p className="line-clamp-1 font-semibold text-white">{movie.title}</p>
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  {movie.year ?? "Unknown year"} | rating {movie.rating.toFixed(1)}
                </p>
                <p className="line-clamp-2 text-xs text-slate-400">{movie.overview || "No overview."}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={isLoading || page <= 1}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={isLoading || page >= totalPages}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
