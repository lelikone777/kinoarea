"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/layout/PageShell";
import { CatalogGridCard } from "../components/ui/CatalogGridCard";
import { Button } from "../components/ui/Button";
import { ErrorCard, InfoCard } from "../components/ui/Cards";
import { StyledSelect, type StyledSelectOption } from "../components/ui/StyledSelect";
import { useUiDictionary } from "../hooks/useUiDictionary";

type TrailerCatalogItem = {
  movieId: number;
  movieTitle: string;
  trailerKey: string;
  title: string;
  type: string;
  official: boolean;
  publishedAt?: string;
  image: string;
};

type TrailersApiResponse = {
  items: TrailerCatalogItem[];
  page: number;
  hasMore: boolean;
  error?: string;
};

const PAGE_SIZE = 12;
type TrailerTypeFilter = "all" | "trailer" | "teaser" | "clip";

function getTrailerUrl(trailerKey: string) {
  return `https://www.youtube.com/watch?v=${trailerKey}`;
}

function normalizeTrailerType(type: string) {
  const normalized = type.trim().toLowerCase();
  if (normalized === "official trailer") return "Trailer";
  if (normalized === "teaser") return "Teaser";
  if (normalized === "clip") return "Clip";
  return type;
}

function parseTrailerTypeParam(value: string | null): TrailerTypeFilter {
  if (value === "trailer" || value === "teaser" || value === "clip") {
    return value;
  }
  return "all";
}

function parseOfficialParam(value: string | null) {
  return value === "1" || value === "true";
}

function readFiltersFromUrl() {
  if (typeof window === "undefined") {
    return { trailerType: "all" as TrailerTypeFilter, officialOnly: false };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    trailerType: parseTrailerTypeParam(params.get("type")),
    officialOnly: parseOfficialParam(params.get("official")),
  };
}

export default function TrailersPage() {
  const { language, dictionary } = useUiDictionary();
  const [items, setItems] = useState<TrailerCatalogItem[]>([]);
  const [page, setPage] = useState(1);
  const [trailerType, setTrailerType] = useState<TrailerTypeFilter>("all");
  const [officialOnly, setOfficialOnly] = useState(false);
  const [isFiltersHydrated, setIsFiltersHydrated] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const applyFromUrl = () => {
      const next = readFiltersFromUrl();
      setTrailerType((current) => (current === next.trailerType ? current : next.trailerType));
      setOfficialOnly((current) => (current === next.officialOnly ? current : next.officialOnly));
      setIsFiltersHydrated(true);
    };

    applyFromUrl();
    window.addEventListener("popstate", applyFromUrl);
    return () => window.removeEventListener("popstate", applyFromUrl);
  }, []);

  useEffect(() => {
    if (!isFiltersHydrated || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (trailerType === "all") {
      params.delete("type");
    } else {
      params.set("type", trailerType);
    }

    if (officialOnly) {
      params.set("official", "1");
    } else {
      params.delete("official");
    }

    const nextSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");
    if (nextSearch === currentSearch) {
      return;
    }

    const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [isFiltersHydrated, trailerType, officialOnly]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
  }, [language]);

  useEffect(() => {
    if (!isFiltersHydrated) {
      return;
    }

    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          language,
          trailerType,
          officialOnly: officialOnly ? "1" : "0",
        });

        const response = await fetch(`/api/tmdb/trailers?${params.toString()}`);
        const data = (await response.json()) as TrailersApiResponse;

        if (!response.ok) {
          throw new Error(data.error || "Failed to load trailers.");
        }

        if (!mounted) {
          return;
        }

        setItems((current) => (page === 1 ? data.items : [...current, ...data.items]));
        setHasMore(Boolean(data.hasMore));
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Failed to load trailers.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [page, language, trailerType, officialOnly, isFiltersHydrated]);

  const subtitle = useMemo(() => {
    return `${dictionary.trailers.title}. YouTube / TMDB`;
  }, [dictionary.trailers.title]);

  const typeFilterOptions = useMemo<StyledSelectOption[]>(() => {
    if (language === "ru-RU") {
      return [
        { value: "all", label: "Все типы" },
        { value: "trailer", label: "Трейлер" },
        { value: "teaser", label: "Тизер" },
        { value: "clip", label: "Клип" },
      ];
    }
    if (language === "de-DE") {
      return [
        { value: "all", label: "Alle Typen" },
        { value: "trailer", label: "Trailer" },
        { value: "teaser", label: "Teaser" },
        { value: "clip", label: "Clip" },
      ];
    }
    if (language === "es-ES") {
      return [
        { value: "all", label: "Todos los tipos" },
        { value: "trailer", label: "Trailer" },
        { value: "teaser", label: "Teaser" },
        { value: "clip", label: "Clip" },
      ];
    }
    if (language === "pt-BR") {
      return [
        { value: "all", label: "Todos os tipos" },
        { value: "trailer", label: "Trailer" },
        { value: "teaser", label: "Teaser" },
        { value: "clip", label: "Clip" },
      ];
    }
    return [
      { value: "all", label: "All types" },
      { value: "trailer", label: "Trailer" },
      { value: "teaser", label: "Teaser" },
      { value: "clip", label: "Clip" },
    ];
  }, [language]);

  const officialOnlyLabel = useMemo(() => {
    if (language === "ru-RU") return "Только официальные";
    if (language === "de-DE") return "Nur offiziell";
    if (language === "es-ES") return "Solo oficiales";
    if (language === "pt-BR") return "Somente oficiais";
    return "Official only";
  }, [language]);

  return (
    <PageShell>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{dictionary.trailers.all}</h1>
        <p className="text-sm text-slate-300">{subtitle}</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <StyledSelect
          value={trailerType}
          onChange={(nextValue) => {
            setItems([]);
            setPage(1);
            setHasMore(false);
            setTrailerType(nextValue as TrailerTypeFilter);
          }}
          options={typeFilterOptions}
          placeholder={typeFilterOptions[0]?.label ?? "All types"}
        />
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white">
          <input
            type="checkbox"
            checked={officialOnly}
            onChange={(event) => {
              setItems([]);
              setPage(1);
              setHasMore(false);
              setOfficialOnly(event.target.checked);
            }}
            className="h-4 w-4 accent-sky-400"
          />
          {officialOnlyLabel}
        </label>
      </div>

      {error ? <ErrorCard>{error}</ErrorCard> : null}

      {!isLoading && !error && items.length === 0 ? <InfoCard>{dictionary.nowPlaying.noResults}</InfoCard> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <CatalogGridCard
            key={`${item.movieId}-${item.trailerKey}`}
            imageSrc={item.image}
            imageAlt={item.title}
            title={item.movieTitle}
            meta={`${normalizeTrailerType(item.type)}${item.official ? " | Official" : ""}`}
            description={item.title}
            onActivate={() => window.open(getTrailerUrl(item.trailerKey), "_blank", "noopener,noreferrer")}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setPage((current) => current + 1)} disabled={isLoading}>
            {isLoading ? dictionary.common.loading : `${dictionary.movies.showMore} ${PAGE_SIZE}`}
          </Button>
        </div>
      ) : null}
    </PageShell>
  );
}
