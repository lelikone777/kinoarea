"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "../components/layout/PageShell";
import { StyledSelect, type StyledSelectOption } from "../components/ui/StyledSelect";
import { Button } from "../components/ui/Button";
import { ErrorCard, InfoCard } from "../components/ui/Cards";
import { PaginationToolbar } from "../components/ui/PaginationToolbar";
import { CatalogGridCard } from "../components/ui/CatalogGridCard";

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
  { value: "popularity.desc", label: "Популярные" },
  { value: "now_playing.desc", label: "Сейчас в прокате" },
  { value: "vote_average.desc", label: "С высоким рейтингом" },
  { value: "release_date.desc", label: "Сначала новые" },
  { value: "revenue.desc", label: "По кассовым сборам" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];
const DEFAULT_SORT_BY: SortValue = "popularity.desc";

function parseSortBy(value: string | null): SortValue {
  if (!value) {
    return DEFAULT_SORT_BY;
  }
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SortValue)
    : DEFAULT_SORT_BY;
}

const CATALOG_PAGE_SIZE = 8;
const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500;

export default function MoviesPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [year, setYear] = useState<string>("");
  const [genreId, setGenreId] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortValue>(DEFAULT_SORT_BY);
  const [isSortInitialized, setIsSortInitialized] = useState(false);
  const [page, setPage] = useState(1);
  const [visiblePages, setVisiblePages] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const [items, setItems] = useState<CatalogMovie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultsRaw, setTotalResultsRaw] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(
    () => Array.from({ length: 80 }, (_, index) => String(currentYear - index)),
    [currentYear],
  );
  const yearOptions = useMemo<StyledSelectOption[]>(
    () => [{ value: "", label: "Любой год" }, ...years.map((value) => ({ value, label: value }))],
    [years],
  );
  const genreOptions = useMemo<StyledSelectOption[]>(
    () => [{ value: "", label: "Все жанры" }, ...genres.map((genre) => ({ value: String(genre.id), label: genre.name }))],
    [genres],
  );
  const sortOptions = useMemo<StyledSelectOption[]>(
    () => SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    [],
  );

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSortBy(parseSortBy(params.get("sortBy")));
    setIsSortInitialized(true);
  }, []);

  useEffect(() => {
    if (!isSortInitialized) {
      return;
    }

    let isMounted = true;

    const loadMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const startIndex = (page - 1) * CATALOG_PAGE_SIZE;
        const requiredCount = visiblePages * CATALOG_PAGE_SIZE;
        const endIndex = startIndex + requiredCount - 1;

        const tmdbStartPage = Math.max(1, Math.floor(startIndex / TMDB_PAGE_SIZE) + 1);
        const tmdbEndPage = Math.max(tmdbStartPage, Math.floor(endIndex / TMDB_PAGE_SIZE) + 1);
        const boundedStart = Math.min(tmdbStartPage, TMDB_MAX_PAGE);
        const boundedEnd = Math.min(tmdbEndPage, TMDB_MAX_PAGE);

        const fetchPage = async (tmdbPage: number) => {
          const params = new URLSearchParams();
          if (submittedQuery.trim()) params.set("query", submittedQuery.trim());
          if (year) params.set("year", year);
          if (genreId) params.set("genreId", genreId);
          params.set("sortBy", sortBy);
          params.set("page", String(tmdbPage));

          const response = await fetch(`/api/tmdb/movies?${params.toString()}`);
          const data = (await response.json()) as MoviesApiResponse;
          if (!response.ok) {
            throw new Error(data.error || "Не удалось загрузить каталог TMDB");
          }
          return { tmdbPage, data };
        };

        const pagesToFetch: number[] = [];
        for (let tmdbPage = boundedStart; tmdbPage <= boundedEnd; tmdbPage += 1) {
          pagesToFetch.push(tmdbPage);
        }

        const responses = await Promise.all(pagesToFetch.map((tmdbPage) => fetchPage(tmdbPage)));
        if (!isMounted) {
          return;
        }

        const meta = responses[0]?.data;
        const rawTotalResults = Number(meta?.totalResults) || 0;
        const accessibleResults = Math.min(rawTotalResults, TMDB_MAX_PAGE * TMDB_PAGE_SIZE);
        const computedTotalPages = Math.max(1, Math.ceil(accessibleResults / CATALOG_PAGE_SIZE));

        if (page > computedTotalPages) {
          setPage(computedTotalPages);
          setVisiblePages(1);
          return;
        }

        setTotalResultsRaw(rawTotalResults);
        setTotalResults(accessibleResults);
        setTotalPages(computedTotalPages);
        setGenres(Array.isArray(meta?.genres) ? meta.genres : []);

        const ordered = [...responses]
          .sort((a, b) => a.tmdbPage - b.tmdbPage)
          .flatMap((entry) => (Array.isArray(entry.data.items) ? entry.data.items : []));

        const baseOffset = startIndex - (boundedStart - 1) * TMDB_PAGE_SIZE;
        const sliced = ordered.slice(baseOffset, baseOffset + requiredCount);

        setItems(sliced);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setItems([]);
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить фильмы");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadMovies();

    return () => {
      isMounted = false;
    };
  }, [submittedQuery, year, genreId, sortBy, page, visiblePages, isSortInitialized]);

  const hasFilters = Boolean(submittedQuery.trim() || year || genreId);
  const shownUntilPage = Math.min(totalPages, page + visiblePages - 1);
  const leftPages = Math.max(0, page - 1);
  const rightPages = Math.max(0, totalPages - shownUntilPage);
  const canShowMore = !isLoading && rightPages > 0;

  const goToPage = (targetPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, targetPage));
    setPage(clamped);
    setVisiblePages(1);
  };

  return (
    <PageShell>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Каталог фильмов TMDB</h1>
          <p className="text-sm text-slate-300">Ищите и фильтруйте фильмы с помощью API The Movie Database.</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setVisiblePages(1);
            setSubmittedQuery(query);
          }}
          className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Название фильма"
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
          />

          <StyledSelect
            value={year}
            onChange={(nextValue) => {
              setPage(1);
              setVisiblePages(1);
              setYear(nextValue);
            }}
            options={yearOptions}
            placeholder="Любой год"
          />

          <StyledSelect
            value={genreId}
            onChange={(nextValue) => {
              setPage(1);
              setVisiblePages(1);
              setGenreId(nextValue);
            }}
            options={genreOptions}
            placeholder="Все жанры"
          />

          <StyledSelect
            value={sortBy}
            onChange={(nextValue) => {
              setPage(1);
              setVisiblePages(1);
              setSortBy(nextValue as SortValue);
            }}
            options={sortOptions}
            placeholder="Сортировка"
          />

          <Button variant="cta">Найти</Button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isLoading ? (
            <p>Загрузка...</p>
          ) : (
            <div className="text-sm">
              <p>Найдено всего: {totalResultsRaw.toLocaleString("ru-RU")}</p>
              <p className="text-slate-400">Доступно для просмотра: {totalResults.toLocaleString("ru-RU")}</p>
            </div>
          )}

          <PaginationToolbar
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            pageInput={pageInput}
            leftPages={leftPages}
            rightPages={rightPages}
            onPageInputChange={setPageInput}
            onGoToPage={goToPage}
            onSubmitPage={() => {
              const parsed = Number.parseInt(pageInput.trim(), 10);
              if (!Number.isFinite(parsed)) {
                setPageInput(String(page));
                return;
              }
              goToPage(parsed);
            }}
          />
        </div>

        {error ? <ErrorCard>{error}</ErrorCard> : null}

        {!isLoading && !error && items.length === 0 ? (
          <InfoCard>
            {hasFilters ? "По текущим фильтрам фильмы не найдены." : "Сейчас фильмы недоступны."}
          </InfoCard>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((movie) => (
            <CatalogGridCard
              key={movie.id}
              imageSrc={movie.poster}
              imageAlt={movie.title}
              title={movie.title}
              meta={`${movie.year ?? "Год неизвестен"} | рейтинг ${movie.rating.toFixed(1)}`}
              description={movie.overview || "Описание отсутствует."}
              onActivate={() => router.push(`/movies/${movie.id}`)}
            />
          ))}
        </div>

        {canShowMore ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisiblePages((value) => Math.min(value + 1, totalPages - page + 1))}
              className="rounded-2xl border border-white/15 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-sky-300/60 hover:bg-slate-900"
            >
              Показать ещё {CATALOG_PAGE_SIZE}
            </button>
          </div>
        ) : null}
    </PageShell>
  );
}

