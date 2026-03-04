"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "../components/layout/PageShell";
import { StyledSelect, type StyledSelectOption } from "../components/ui/StyledSelect";
import { Button } from "../components/ui/Button";
import { ErrorCard, InfoCard } from "../components/ui/Cards";
import { FilterWidgetField, FilterWidgetForm } from "../components/ui/filters/FilterWidget";
import { PaginationToolbar } from "../components/ui/PaginationToolbar";
import { CatalogGridCard } from "../components/ui/CatalogGridCard";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import { useUiDictionary } from "../hooks/useUiDictionary";
import { formatCountWithNoun } from "../lib/pluralize";

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

type SortValue = "popularity.desc";
const DEFAULT_SORT_BY: SortValue = "popularity.desc";
const CATALOG_PAGE_SIZE = 8;
const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500;
const URL_QUERY_KEY = "query";
const URL_SORT_KEY = "sortBy";
const URL_PAGE_KEY = "page";

function parseSortBy(value: string | null): SortValue {
  return value === "popularity.desc" ? "popularity.desc" : DEFAULT_SORT_BY;
}

function readActorsFiltersFromUrl() {
  if (typeof window === "undefined") {
    return { query: "", sortBy: DEFAULT_SORT_BY as SortValue, page: 1 };
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get(URL_QUERY_KEY)?.trim() ?? "";
  const pageRaw = Number.parseInt(params.get(URL_PAGE_KEY) ?? "1", 10);

  return {
    query,
    sortBy: parseSortBy(params.get(URL_SORT_KEY)),
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

export default function ActorsPage() {
  const router = useRouter();
  const { language } = useSiteLanguage();
  const { dictionary } = useUiDictionary();

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>(DEFAULT_SORT_BY);
  const [isFiltersHydrated, setIsFiltersHydrated] = useState(false);
  const [page, setPage] = useState(1);
  const [visiblePages, setVisiblePages] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const [items, setItems] = useState<CatalogPerson[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultsRaw, setTotalResultsRaw] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, true>>({});
  const [ratingMap, setRatingMap] = useState<Record<number, { average: number | null; count: number }>>({});

  const resetCatalogState = useCallback(() => {
    setItems([]);
    setTotalPages(1);
    setTotalResultsRaw(0);
    setTotalResults(0);
  }, []);

  const sortOptions = useMemo<StyledSelectOption[]>(
    () => [{ value: "popularity.desc", label: dictionary.actors.sort }],
    [dictionary.actors.sort],
  );

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    const applyFromUrl = () => {
      const next = readActorsFiltersFromUrl();
      setQuery(next.query);
      setSubmittedQuery(next.query);
      setSortBy(next.sortBy);
      setPage(next.page);
      setVisiblePages(1);
      resetCatalogState();
      setIsFiltersHydrated(true);
    };

    applyFromUrl();
    window.addEventListener("popstate", applyFromUrl);
    return () => window.removeEventListener("popstate", applyFromUrl);
  }, [resetCatalogState]);

  useEffect(() => {
    if (!isFiltersHydrated || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (submittedQuery) {
      params.set(URL_QUERY_KEY, submittedQuery);
    } else {
      params.delete(URL_QUERY_KEY);
    }

    if (sortBy !== DEFAULT_SORT_BY) {
      params.set(URL_SORT_KEY, sortBy);
    } else {
      params.delete(URL_SORT_KEY);
    }

    if (page > 1) {
      params.set(URL_PAGE_KEY, String(page));
    } else {
      params.delete(URL_PAGE_KEY);
    }

    const nextSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");
    if (nextSearch === currentSearch) {
      return;
    }

    const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [submittedQuery, sortBy, page, isFiltersHydrated]);

  useEffect(() => {
    if (!isFiltersHydrated) {
      return;
    }

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
          params.set("language", language);

          const response = await fetch(`/api/tmdb/people?${params.toString()}`);
          const data = (await response.json()) as PeopleApiResponse;
          if (!response.ok) {
            throw new Error(data.error || "Failed to load TMDB people catalog");
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
        setError(loadError instanceof Error ? loadError.message : "Failed to load people");
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
  }, [submittedQuery, sortBy, page, visiblePages, language, isFiltersHydrated]);

  useEffect(() => {
    if (!items.length) {
      setRatingMap({});
      return;
    }

    const ids = items.map((item) => item.id).join(",");
    let isMounted = true;

    const loadRatings = async () => {
      try {
        const response = await fetch(`/api/ratings/actors?ids=${ids}`);
        const payload = (await response.json()) as { ratings?: Record<number, { average: number | null; count: number }> };
        if (isMounted && payload?.ratings) {
          setRatingMap(payload.ratings);
        }
      } catch {
        if (isMounted) {
          setRatingMap({});
        }
      }
    };

    void loadRatings();
    return () => {
      isMounted = false;
    };
  }, [items]);

  const hasFilters = Boolean(submittedQuery.trim());
  const shownUntilPage = Math.min(totalPages, page + visiblePages - 1);
  const leftPages = Math.max(0, page - 1);
  const rightPages = Math.max(0, totalPages - shownUntilPage);
  const canShowMore = !isLoading && rightPages > 0;
  const totalFoundLabel = formatCountWithNoun(totalResultsRaw, language, {
    ru: ["актер", "актера", "актеров"],
    other: ["actor", "actors"],
  });
  const totalAvailableLabel = formatCountWithNoun(totalResults, language, {
    ru: ["актер", "актера", "актеров"],
    other: ["actor", "actors"],
  });

  const goToPage = (targetPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, targetPage));
    setPage(clamped);
    setVisiblePages(1);
  };

  return (
    <PageShell>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{dictionary.actors.title}</h1>
        <p className="text-sm text-slate-300">{dictionary.actors.subtitle}</p>
      </div>

      <FilterWidgetForm
        onSubmit={(event) => {
          event.preventDefault();
          resetCatalogState();
          setPage(1);
          setVisiblePages(1);
          setSubmittedQuery(query.trim());
        }}
        className="sm:grid-cols-2 lg:grid-cols-4"
      >
        <FilterWidgetField>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dictionary.actors.searchPlaceholder}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
          />
        </FilterWidgetField>

        <FilterWidgetField>
          <StyledSelect
            value={sortBy}
            onChange={(nextValue) => {
              resetCatalogState();
              setPage(1);
              setVisiblePages(1);
              setSortBy(nextValue as SortValue);
            }}
            options={sortOptions}
            placeholder={dictionary.actors.sort}
          />
        </FilterWidgetField>

        <FilterWidgetField className="sm:col-span-2 lg:col-span-1">
          <Button variant="cta">{dictionary.actors.search}</Button>
        </FilterWidgetField>
      </FilterWidgetForm>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isLoading ? (
          <p>{dictionary.common.loading}</p>
        ) : (
          <div className="text-sm">
            <p>{dictionary.actors.totalFound}: {totalFoundLabel}</p>
            <p className="text-slate-400">{dictionary.actors.totalAvailable}: {totalAvailableLabel}</p>
          </div>
        )}

        <PaginationToolbar
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          pageInput={pageInput}
          leftPages={leftPages}
          rightPages={rightPages}
          label={dictionary.actors.pages}
          goToLabel={dictionary.actors.goto}
          pageInputAria={dictionary.actors.pageInputAria}
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
        <InfoCard>{hasFilters ? dictionary.actors.notFoundByFilters : dictionary.actors.unavailable}</InfoCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((person) => (
          <CatalogGridCard
            key={person.id}
            imageSrc={failedImages[person.id] ? "/placeholders/avatar.svg" : person.profile}
            imageAlt={person.name}
            title={person.name}
            meta={`${person.department || dictionary.actors.actorFallback} | ${dictionary.reviews.ratingLabel} ${
              ratingMap[person.id]?.average ? ratingMap[person.id]?.average?.toFixed(1) : dictionary.reviews.ratingMissing
            }${ratingMap[person.id]?.count ? ` (${ratingMap[person.id]?.count})` : ""}`}
            description={person.knownFor.length ? person.knownFor.join(" | ") : dictionary.actors.careerUpdating}
            onActivate={() => router.push(`/actors/${person.id}`)}
            imageProps={{
              unoptimized: true,
              onError: () => {
                setFailedImages((current) => (current[person.id] ? current : { ...current, [person.id]: true }));
              },
            }}
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
            {dictionary.actors.showMore} {CATALOG_PAGE_SIZE}
          </button>
        </div>
      ) : null}
    </PageShell>
  );
}
