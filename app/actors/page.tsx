"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { navLinks } from "../data/content";
import { StyledSelect, type StyledSelectOption } from "../components/ui/StyledSelect";

type CatalogPerson = {
  id: number;
  name: string;
  department: string;
  popularity: number;
  profile: string;
  knownFor: string[];
};

type PeopleApiResponse = {
  items: CatalogPerson[];
  page: number;
  totalPages: number;
  totalResults: number;
  error?: string;
};

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Популярные" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];
const DEFAULT_SORT_BY: SortValue = "popularity.desc";
const CATALOG_PAGE_SIZE = 8;
const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500;

export default function ActorsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>(DEFAULT_SORT_BY);
  const [page, setPage] = useState(1);
  const [visiblePages, setVisiblePages] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const [items, setItems] = useState<CatalogPerson[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultsRaw, setTotalResultsRaw] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortOptions = useMemo<StyledSelectOption[]>(
    () => SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    [],
  );

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    let isMounted = true;

    const loadPeople = async () => {
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
          params.set("sortBy", sortBy);
          params.set("page", String(tmdbPage));

          const response = await fetch(`/api/tmdb/people?${params.toString()}`);
          const data = (await response.json()) as PeopleApiResponse;
          if (!response.ok) {
            throw new Error(data.error || "Не удалось загрузить каталог актеров TMDB");
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
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить актеров");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPeople();

    return () => {
      isMounted = false;
    };
  }, [submittedQuery, sortBy, page, visiblePages]);

  const hasFilters = Boolean(submittedQuery.trim());
  const shownUntilPage = Math.min(totalPages, page + visiblePages - 1);
  const leftPages = Math.max(0, page - 1);
  const rightPages = Math.max(0, totalPages - shownUntilPage);
  const canShowMore = !isLoading && rightPages > 0;
  const [failedImages, setFailedImages] = useState<Record<number, true>>({});

  const goToPage = (targetPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, targetPage));
    setPage(clamped);
    setVisiblePages(1);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto max-w-6xl space-y-6 px-5 pb-24 pt-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Каталог актеров TMDB</h1>
          <p className="text-sm text-slate-300">Ищите актеров и открывайте их фильмографию.</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setVisiblePages(1);
            setSubmittedQuery(query);
          }}
          className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Имя актера"
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
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

          <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 sm:col-span-2 lg:col-span-1">
            Найти
          </button>
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

          <div className="ml-auto flex w-full max-w-2xl flex-wrap items-center justify-end gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-2 text-sm text-slate-200">
            <span className="px-2 text-xs uppercase tracking-[0.12em] text-slate-400">Страницы</span>
            <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300">← {leftPages}</span>
            <button
              type="button"
              onClick={() => goToPage(page - 10)}
              disabled={isLoading || page <= 1}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs transition hover:border-white/40 disabled:opacity-40"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={isLoading || page <= 1}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs transition hover:border-white/40 disabled:opacity-40"
            >
              ←
            </button>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const parsed = Number.parseInt(pageInput.trim(), 10);
                if (!Number.isFinite(parsed)) {
                  setPageInput(String(page));
                  return;
                }
                goToPage(parsed);
              }}
              className="flex items-center gap-2"
            >
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value.replace(/[^\d]/g, ""))}
                className="w-20 rounded-lg border border-white/15 bg-slate-950/80 px-2 py-1.5 text-center text-sm text-white outline-none transition focus:border-sky-300/60"
                aria-label="Номер страницы"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:opacity-90 disabled:opacity-50"
              >
                Перейти
              </button>
            </form>

            <span className="px-1 text-xs text-slate-400">/ {totalPages}</span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={isLoading || page >= totalPages}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs transition hover:border-white/40 disabled:opacity-40"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => goToPage(page + 10)}
              disabled={isLoading || page >= totalPages}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs transition hover:border-white/40 disabled:opacity-40"
            >
              +10
            </button>
            <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300">{rightPages} →</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
            {hasFilters ? "По текущему запросу актеры не найдены." : "Сейчас актеры недоступны."}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((person) => (
            <article
              key={person.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/actors/${person.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/actors/${person.id}`);
                }
              }}
              className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition hover:-translate-y-1 hover:border-sky-300/40"
            >
              <div className="relative aspect-[2/3]">
                <Image
                  src={failedImages[person.id] ? "/placeholders/avatar.svg" : person.profile}
                  alt={person.name}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => {
                    setFailedImages((current) => (current[person.id] ? current : { ...current, [person.id]: true }));
                  }}
                />
              </div>

              <div className="space-y-2 p-3">
                <p className="line-clamp-1 font-semibold text-white">{person.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  {person.department || "Актер"} | популярность {person.popularity.toFixed(1)}
                </p>
                <p className="line-clamp-2 text-xs text-slate-400">
                  {person.knownFor.length ? person.knownFor.join(" • ") : "Карьера обновляется."}
                </p>
              </div>
            </article>
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
      </main>

      <Footer />
    </div>
  );
}
