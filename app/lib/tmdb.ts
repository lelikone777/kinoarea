import type { BoxOffice, Movie, Person, Trailer } from "../data/content";
import type { TrailerHero } from "../components/sections/TrailersSection";
import { getLanguageBase, normalizeSiteLanguage, type SiteLanguage } from "./language";
import { createSwrMemoryCache } from "./swrMemoryCache";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const FALLBACK_POSTER = "/placeholders/poster.svg";
const FALLBACK_BACKDROP = "/placeholders/backdrop.svg";
const FALLBACK_AVATAR = "/placeholders/avatar.svg";
const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "0.0.0.0", "::"]);
let tmdbReachablePromise: Promise<boolean> | null = null;
const tmdbCache = createSwrMemoryCache({
  maxEntries: 700,
  errorTtlMs: 45_000,
  staleFactor: 3,
  maxStaleMs: 7 * 24 * 60 * 60 * 1000,
  staleOnErrorExtendMs: 30_000,
});

type TmdbConfigResponse = {
  images: {
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
    profile_sizes: string[];
  };
};

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  runtime?: number;
  release_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
};

type TmdbGenreResponse = {
  genres: { id: number; name: string }[];
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbCatalogSortBy =
  | "popularity.desc"
  | "now_playing.desc"
  | "vote_average.desc"
  | "release_date.desc"
  | "revenue.desc";

export type TmdbBoxOfficePeriod = "weekend" | "month" | "year" | "all";
export type TmdbBoxOfficeSortBy = "revenue.desc" | "popularity.desc" | "vote_average.desc" | "release_date.desc";
export type TmdbBoxOfficeReleaseType = "all" | "theatrical";

type BoxOfficeInput = {
  language?: SiteLanguage;
  period?: TmdbBoxOfficePeriod;
  sortBy?: TmdbBoxOfficeSortBy;
  region?: string;
  genreId?: number;
  originalLanguage?: string;
  releaseType?: TmdbBoxOfficeReleaseType;
  limit?: number;
};

export type TmdbCatalogMovie = {
  id: number;
  title: string;
  year?: number;
  type: "movie";
  poster: string;
  rating: number;
  overview: string;
  genres: string[];
};

type CatalogMoviesInput = {
  query?: string;
  year?: number;
  genreId?: number;
  page?: number;
  sortBy?: TmdbCatalogSortBy;
  language?: SiteLanguage;
};

type CatalogMoviesResult = {
  items: TmdbCatalogMovie[];
  page: number;
  totalPages: number;
  totalResults: number;
};

type TmdbPersonKnownFor = {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
  popularity?: number;
};

type TmdbPersonListItem = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  popularity: number;
  known_for?: TmdbPersonKnownFor[];
};

export type TmdbPeopleSortBy = "popularity.desc";

export type TmdbCatalogPerson = {
  id: number;
  name: string;
  department: string;
  popularity: number;
  profile: string;
  knownFor: string[];
};

type CatalogPeopleInput = {
  query?: string;
  page?: number;
  sortBy?: TmdbPeopleSortBy;
  language?: SiteLanguage;
};

type CatalogPeopleResult = {
  items: TmdbCatalogPerson[];
  page: number;
  totalPages: number;
  totalResults: number;
};

type TmdbCastMember = {
  name: string;
  character?: string;
  profile_path: string | null;
};

type TmdbVideo = {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at?: string;
};

type TmdbVideosResponse = {
  id: number;
  results: TmdbVideo[];
};

export type TmdbTrailerCatalogItem = {
  movieId: number;
  movieTitle: string;
  trailerKey: string;
  title: string;
  type: string;
  official: boolean;
  publishedAt?: string;
  image: string;
};

type TrailerCatalogInput = {
  page?: number;
  limit?: number;
  language?: SiteLanguage;
  trailerType?: "all" | "trailer" | "teaser" | "clip";
  officialOnly?: boolean;
};

type TrailerCatalogResult = {
  items: TmdbTrailerCatalogItem[];
  page: number;
  hasMore: boolean;
};

type TmdbLocalizedLabels = {
  movieFallback: string;
  premierePrefix: string;
  actorFallback: string;
  popularTag: string;
  nowPlayingTag: string;
  soonTag: string;
  trailerSoonTitle: string;
  trailerLabel: string;
  trailerWeekTag: string;
  recommendationsTag: string;
  similarTag: string;
};

const localizedLabelsByBaseLanguage: Record<string, TmdbLocalizedLabels> = {
  ru: {
    movieFallback: "Фильм",
    premierePrefix: "Премьера",
    actorFallback: "Актер",
    popularTag: "Популярное",
    nowPlayingTag: "Сейчас в кино",
    soonTag: "Скоро",
    trailerSoonTitle: "Трейлер скоро",
    trailerLabel: "Трейлер",
    trailerWeekTag: "Трейлер недели",
    recommendationsTag: "Рекомендации",
    similarTag: "Похожее",
  },
  en: {
    movieFallback: "Movie",
    premierePrefix: "Premiere",
    actorFallback: "Actor",
    popularTag: "Popular",
    nowPlayingTag: "Now in theaters",
    soonTag: "Coming soon",
    trailerSoonTitle: "Trailer soon",
    trailerLabel: "Trailer",
    trailerWeekTag: "Trailer of the week",
    recommendationsTag: "Recommendations",
    similarTag: "Similar",
  },
  es: {
    movieFallback: "Película",
    premierePrefix: "Estreno",
    actorFallback: "Actor",
    popularTag: "Popular",
    nowPlayingTag: "En cines",
    soonTag: "Próximamente",
    trailerSoonTitle: "Tráiler pronto",
    trailerLabel: "Tráiler",
    trailerWeekTag: "Tráiler de la semana",
    recommendationsTag: "Recomendaciones",
    similarTag: "Similares",
  },
  de: {
    movieFallback: "Film",
    premierePrefix: "Premiere",
    actorFallback: "Schauspieler",
    popularTag: "Beliebt",
    nowPlayingTag: "Jetzt im Kino",
    soonTag: "Bald",
    trailerSoonTitle: "Trailer bald",
    trailerLabel: "Trailer",
    trailerWeekTag: "Trailer der Woche",
    recommendationsTag: "Empfehlungen",
    similarTag: "Ähnlich",
  },
  pt: {
    movieFallback: "Filme",
    premierePrefix: "Estreia",
    actorFallback: "Ator",
    popularTag: "Popular",
    nowPlayingTag: "Em cartaz",
    soonTag: "Em breve",
    trailerSoonTitle: "Trailer em breve",
    trailerLabel: "Trailer",
    trailerWeekTag: "Trailer da semana",
    recommendationsTag: "Recomendações",
    similarTag: "Semelhantes",
  },
};

function getTmdbLocalizedLabels(language: SiteLanguage): TmdbLocalizedLabels {
  const languageBase = getLanguageBase(normalizeSiteLanguage(language));
  return localizedLabelsByBaseLanguage[languageBase] ?? localizedLabelsByBaseLanguage.ru;
}

function isLoopbackAddress(address: string) {
  return LOOPBACK_ADDRESSES.has(address) || address.startsWith("127.");
}

export async function isTmdbReachable(): Promise<boolean> {
  if (tmdbReachablePromise) {
    return tmdbReachablePromise;
  }

  tmdbReachablePromise = (async () => {
    try {
      const { lookup } = await import("node:dns/promises");
      const records = await lookup("api.themoviedb.org", { all: true, verbatim: true });
      if (!records.length) {
        return false;
      }
      const hasExternalAddress = records.some((record) => !isLoopbackAddress(record.address));
      if (!hasExternalAddress) {
        return false;
      }

      const auth = resolveTmdbAuth();
      const probeUrl = new URL(`${TMDB_BASE_URL}/configuration`);
      if (auth.apiKey) {
        probeUrl.searchParams.set("api_key", auth.apiKey);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch(probeUrl.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...auth.headers,
          },
          cache: "no-store",
          signal: controller.signal,
        });
        return response.ok;
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      return false;
    }
  })();

  return tmdbReachablePromise;
}

function resolveTmdbAuth() {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  const apiKey = process.env.TMDB_API_KEY?.trim();

  if (token) {
    return {
      headers: { Authorization: `Bearer ${token}` },
      apiKey: undefined as string | undefined,
    };
  }

  if (apiKey) {
    return {
      headers: {} as Record<string, string>,
      apiKey,
    };
  }

  throw new Error("TMDB credentials are not set. Provide TMDB_ACCESS_TOKEN or TMDB_API_KEY.");
}

function getTmdbNetworkHint(error: unknown): string | null {
  const cause = (
    error as {
      cause?: {
        code?: string;
        address?: string;
        port?: number;
      };
    }
  )?.cause;

  if (
    cause?.code === "ECONNREFUSED" &&
    (cause.address === "127.0.0.1" || cause.address === "::1")
  ) {
    const port = cause.port ?? 443;
    return `TMDB network error: DNS/proxy resolves TMDB to localhost (${cause.address}:${port}).`;
  }

  return null;
}

class TmdbRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "TmdbRequestError";
    this.status = status;
  }
}

function sortParams(params: Record<string, string | number | undefined>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
}

function buildTmdbCacheKey(path: string, params: Record<string, string | number | undefined>) {
  const serializedParams = sortParams(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return `${path}?${serializedParams}`;
}

function shouldRememberAsTransientError(error: unknown) {
  if (!(error instanceof TmdbRequestError)) {
    return true;
  }
  return error.status === 429 || (error.status !== undefined && error.status >= 500);
}

async function fetchTmdbNetwork<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  revalidateSeconds: number,
): Promise<T> {
  const auth = resolveTmdbAuth();
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  if (auth.apiKey) {
    url.searchParams.set("api_key", auth.apiKey);
  }

  for (const [key, value] of sortParams(params)) {
    url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        ...auth.headers,
      },
      next: { revalidate: revalidateSeconds },
    });
  } catch (error) {
    const hint = getTmdbNetworkHint(error);
    if (hint) {
      throw new TmdbRequestError(hint, undefined, { cause: error as Error });
    }
    throw new TmdbRequestError("TMDB request failed due to network error.", undefined, { cause: error as Error });
  }

  if (!res.ok) {
    throw new TmdbRequestError(`TMDB request failed (${res.status}): ${await res.text()}`, res.status);
  }

  return res.json() as Promise<T>;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 60 * 10
): Promise<T> {
  const cacheKey = buildTmdbCacheKey(path, params);
  return tmdbCache.getOrSet<T>({
    key: cacheKey,
    ttlMs: revalidateSeconds * 1000,
    load: () => fetchTmdbNetwork<T>(path, params, revalidateSeconds),
    shouldCacheError: shouldRememberAsTransientError,
  });
}

export async function getTmdbConfiguration() {
  return tmdbFetch<TmdbConfigResponse>("/configuration", {}, 60 * 60 * 24);
}

export async function getMovieGenres(language: SiteLanguage = "ru-RU"): Promise<TmdbGenre[]> {
  const { genres } = await tmdbFetch<TmdbGenreResponse>(
    "/genre/movie/list",
    { language: normalizeSiteLanguage(language) },
    60 * 60 * 24
  );
  return genres;
}

async function getGenresMap(language: SiteLanguage = "ru-RU") {
  const genres = await getMovieGenres(language);
  return new Map(genres.map((genre) => [genre.id, genre.name]));
}

type ImageAssetsContext = {
  base: string;
  posterSize: string;
  backdropSize: string;
  profileSize: string;
};

function pickPosterSize(sizes: string[]) {
  const preferred = ["w500", "w780", "original"];
  for (const size of preferred) {
    if (sizes.includes(size)) return size;
  }
  return sizes.at(-1) ?? "w500";
}

function pickBackdropSize(sizes: string[]) {
  const preferred = ["w780", "w1280", "original"];
  for (const size of preferred) {
    if (sizes.includes(size)) return size;
  }
  return sizes.at(-1) ?? "w780";
}

function pickProfileSize(sizes: string[]) {
  const preferred = ["w185", "w154", "w92"];
  for (const size of preferred) {
    if (sizes.includes(size)) return size;
  }
  return sizes.at(0) ?? "w185";
}

async function getImageAssetsContext(): Promise<ImageAssetsContext> {
  const config = await getTmdbConfiguration();
  const base = config.images.secure_base_url || "https://image.tmdb.org/t/p/";
  const posterSize = pickPosterSize(config.images.poster_sizes);
  const backdropSize = pickBackdropSize(config.images.backdrop_sizes);
  const profileSize = pickProfileSize(config.images.profile_sizes);
  return { base, posterSize, backdropSize, profileSize };
}

async function getAssetsContext(language: SiteLanguage = "ru-RU") {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const [imageAssets, genresMap] = await Promise.all([getImageAssetsContext(), getGenresMap(normalizedLanguage)]);
  const { base, posterSize, backdropSize, profileSize } = imageAssets;
  const labels = getTmdbLocalizedLabels(normalizedLanguage);
  return { base, posterSize, backdropSize, profileSize, genresMap, labels };
}

function mapMovie(movie: TmdbMovie, ctx: Awaited<ReturnType<typeof getAssetsContext>>, tag?: string): Movie {
  const genreNames = movie.genre_ids.map((id) => ctx.genresMap.get(id)).filter(Boolean).join(", ");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;

  return {
    id: movie.id,
    title: movie.title,
    genre: genreNames || (year ? `${ctx.labels.premierePrefix} ${year}` : ctx.labels.movieFallback),
    rating: Number(movie.vote_average?.toFixed(1)) || 0,
    tag,
    year,
    releaseDate: movie.release_date,
    popularity: movie.popularity,
    voteCount: movie.vote_count,
    genreIds: movie.genre_ids,
    image: movie.poster_path ? `${ctx.base}${ctx.posterSize}${movie.poster_path}` : FALLBACK_POSTER,
  };
}

type TmdbPagedResponse<T> = {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
};

function mapCatalogMovie(
  movie: TmdbMovie,
  ctx: Awaited<ReturnType<typeof getAssetsContext>>
): TmdbCatalogMovie {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
  const genres = movie.genre_ids
    .map((id) => ctx.genresMap.get(id))
    .filter((name): name is string => Boolean(name));

  return {
    id: movie.id,
    title: movie.title,
    year,
    type: "movie",
    poster: movie.poster_path ? `${ctx.base}${ctx.posterSize}${movie.poster_path}` : FALLBACK_POSTER,
    rating: Number(movie.vote_average?.toFixed(1)) || 0,
    overview: movie.overview || "",
    genres,
  };
}

export async function getCatalogMovies(input: CatalogMoviesInput = {}): Promise<CatalogMoviesResult> {
  const query = input.query?.trim() ?? "";
  const page =
    Number.isFinite(input.page) && Number(input.page) > 0
      ? Math.min(Math.trunc(Number(input.page)), 500)
      : 1;
  const sortBy: TmdbCatalogSortBy = input.sortBy ?? "popularity.desc";
  const year =
    Number.isFinite(input.year) && Number(input.year) > 1800 ? Math.trunc(Number(input.year)) : undefined;
  const genreId =
    Number.isFinite(input.genreId) && Number(input.genreId) > 0
      ? Math.trunc(Number(input.genreId))
      : undefined;

  const language = normalizeSiteLanguage(input.language);
  const ctx = await getAssetsContext(language);
  const isSearch = query.length > 0;
  const params: Record<string, string | number | undefined> = {
    language,
    page,
    include_adult: "false",
  };

  let endpoint = "/discover/movie";
  if (isSearch) {
    endpoint = "/search/movie";
    params.query = query;
    params.primary_release_year = year;
  } else if (sortBy === "now_playing.desc") {
    endpoint = "/movie/now_playing";
    params.region = "RU";
  } else {
    params.sort_by = sortBy;
    params.region = "RU";
    params.primary_release_year = year;
    params.with_genres = genreId;
  }

  const response = await tmdbFetch<TmdbPagedResponse<TmdbMovie>>(endpoint, params);
  const filtered = isSearch && genreId
    ? response.results.filter((movie) => movie.genre_ids.includes(genreId))
    : response.results;

  return {
    items: filtered.map((movie) => mapCatalogMovie(movie, ctx)),
    page: response.page ?? page,
    totalPages: response.total_pages ?? 1,
    totalResults: response.total_results ?? filtered.length,
  };
}

function mapCatalogPerson(
  person: TmdbPersonListItem,
  ctx: Awaited<ReturnType<typeof getImageAssetsContext>>,
  fallbackDepartment: string,
): TmdbCatalogPerson {
  const knownFor = (person.known_for ?? [])
    .map((item) => item.title || item.name)
    .filter((title): title is string => Boolean(title))
    .slice(0, 3);

  return {
    id: person.id,
    name: person.name,
    department: person.known_for_department || fallbackDepartment,
    popularity: person.popularity ?? 0,
    profile: person.profile_path ? `${ctx.base}${ctx.profileSize}${person.profile_path}` : FALLBACK_AVATAR,
    knownFor,
  };
}

export async function getCatalogPeople(input: CatalogPeopleInput = {}): Promise<CatalogPeopleResult> {
  const query = input.query?.trim() ?? "";
  const page =
    Number.isFinite(input.page) && Number(input.page) > 0
      ? Math.min(Math.trunc(Number(input.page)), 500)
      : 1;

  const language = normalizeSiteLanguage(input.language);
  const labels = getTmdbLocalizedLabels(language);
  const params: Record<string, string | number | undefined> = {
    language,
    page,
    include_adult: "false",
  };
  const endpoint = query ? "/search/person" : "/person/popular";
  if (query) {
    params.query = query;
  }

  const [ctx, response] = await Promise.all([
    getImageAssetsContext(),
    tmdbFetch<TmdbPagedResponse<TmdbPersonListItem>>(endpoint, params),
  ]);

  return {
    items: response.results.map((person) => mapCatalogPerson(person, ctx, labels.actorFallback)),
    page: response.page ?? page,
    totalPages: response.total_pages ?? 1,
    totalResults: response.total_results ?? response.results.length,
  };
}

export async function getPopularMovies(limit = 6, year?: number, language: SiteLanguage = "ru-RU"): Promise<Movie[]> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const ctx = await getAssetsContext(normalizedLanguage);
  const endpoint = year ? "/discover/movie" : "/movie/popular";
  const params: Record<string, string | number> = {
    language: normalizedLanguage,
    region: "RU",
    sort_by: "popularity.desc",
    page: 1,
  };
  if (year) {
    params.primary_release_year = year;
  }

  const { results } = await tmdbFetch<{ results: TmdbMovie[] }>(endpoint, params);
  return results.slice(0, limit).map((movie) => mapMovie(movie, ctx, ctx.labels.popularTag));
}

export async function getNowPlayingMovies(limit = 12, language: SiteLanguage = "ru-RU"): Promise<Movie[]> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const ctx = await getAssetsContext(normalizedLanguage);
  const { results } = await tmdbFetch<{ results: TmdbMovie[] }>("/movie/now_playing", {
    language: normalizedLanguage,
    region: "RU",
    page: 1,
  });
  return results.slice(0, limit).map((movie) => mapMovie(movie, ctx, ctx.labels.nowPlayingTag));
}

export async function getUpcomingMovies(limit = 8, language: SiteLanguage = "ru-RU"): Promise<Movie[]> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const ctx = await getAssetsContext(normalizedLanguage);
  const { results } = await tmdbFetch<{ results: TmdbMovie[] }>("/movie/upcoming", {
    language: normalizedLanguage,
    region: "RU",
    page: 1,
  });
  return results.slice(0, limit).map((movie) => mapMovie(movie, ctx, ctx.labels.soonTag));
}

function toIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPeriodRange(period: TmdbBoxOfficePeriod) {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (period === "all") return null;

  if (period === "year") {
    const start = new Date(Date.UTC(todayUtc.getUTCFullYear(), 0, 1));
    return { start: toIsoDate(start), end: toIsoDate(todayUtc) };
  }

  if (period === "month") {
    const start = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), 1));
    return { start: toIsoDate(start), end: toIsoDate(todayUtc) };
  }

  const day = todayUtc.getUTCDay();
  const daysFromSunday = day;
  const lastSunday = new Date(todayUtc);
  lastSunday.setUTCDate(todayUtc.getUTCDate() - daysFromSunday);
  const lastFriday = new Date(lastSunday);
  lastFriday.setUTCDate(lastSunday.getUTCDate() - 2);
  return { start: toIsoDate(lastFriday), end: toIsoDate(lastSunday) };
}

function formatUsdCurrency(value: number, language: SiteLanguage) {
  const locale =
    language === "ru-RU"
      ? "ru-RU"
      : language === "pt-BR"
        ? "pt-BR"
        : language === "es-ES"
          ? "es-ES"
          : language === "de-DE"
            ? "de-DE"
            : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDeltaPercent(current: number, previous: number) {
  if (current <= 0 || previous <= 0) return "—";
  const value = ((current - previous) / previous) * 100;
  const rounded = Math.round(value);
  if (rounded === 0) return "0%";
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export async function getBoxOfficeMovies(input: BoxOfficeInput = {}): Promise<BoxOffice[]> {
  const normalizedLanguage = normalizeSiteLanguage(input.language);
  const period = input.period ?? "weekend";
  const sortBy = input.sortBy ?? "revenue.desc";
  const region = (input.region ?? "RU").toUpperCase();
  const releaseType = input.releaseType ?? "theatrical";
  const limit =
    Number.isFinite(input.limit) && Number(input.limit) > 0
      ? Math.min(12, Math.trunc(Number(input.limit)))
      : 6;
  const genreId =
    Number.isFinite(input.genreId) && Number(input.genreId) > 0
      ? Math.trunc(Number(input.genreId))
      : undefined;
  const originalLanguage =
    input.originalLanguage && /^[a-z]{2}$/i.test(input.originalLanguage)
      ? input.originalLanguage.toLowerCase()
      : undefined;

  const ctx = await getAssetsContext(normalizedLanguage);
  const params: Record<string, string | number | undefined> = {
    language: normalizedLanguage,
    page: 1,
    include_adult: "false",
    include_video: "false",
    sort_by: period === "weekend" ? undefined : sortBy,
    "vote_count.gte": 40,
    with_release_type: releaseType === "theatrical" ? "2|3" : undefined,
    region: region === "ALL" ? undefined : region,
    with_genres: genreId,
    with_original_language: originalLanguage,
  };

  const periodRange = getPeriodRange(period);
  if (period !== "weekend" && periodRange) {
    params["primary_release_date.gte"] = periodRange.start;
    params["primary_release_date.lte"] = periodRange.end;
  }

  const endpoint = period === "weekend" ? "/movie/now_playing" : "/discover/movie";
  let discovered: { results: TmdbMovie[] };
  try {
    discovered = await tmdbFetch<{ results: TmdbMovie[] }>(endpoint, params);
  } catch {
    discovered = await tmdbFetch<{ results: TmdbMovie[] }>("/movie/now_playing", {
      language: normalizedLanguage,
      page: 1,
      include_adult: "false",
      include_video: "false",
      region: region === "ALL" ? undefined : region,
    });
  }
  const candidates = discovered.results.slice(0, Math.max(limit * 4, 16));

  const detailed = await Promise.all(
    candidates.map(async (movie) => {
      try {
        const details = await tmdbFetch<{ id: number; revenue?: number; poster_path: string | null }>(
          `/movie/${movie.id}`,
          { language: normalizedLanguage },
          60 * 30
        );
        return {
          ...movie,
          revenue: details.revenue ?? 0,
          poster_path: details.poster_path ?? movie.poster_path,
        };
      } catch {
        return { ...movie, revenue: 0 };
      }
    })
  );

  let ranked = [...detailed]
    .sort((a, b) => {
      if (sortBy === "revenue.desc") return (b.revenue ?? 0) - (a.revenue ?? 0);
      if (sortBy === "popularity.desc") return (b.popularity ?? 0) - (a.popularity ?? 0);
      if (sortBy === "vote_average.desc") return (b.vote_average ?? 0) - (a.vote_average ?? 0);
      const aDate = a.release_date ? new Date(a.release_date).getTime() : 0;
      const bDate = b.release_date ? new Date(b.release_date).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, limit);

  if (!ranked.length) {
    try {
      const fallbackParams: Record<string, string | number | undefined> = {
        language: normalizedLanguage,
        page: 1,
        include_adult: "false",
        include_video: "false",
        sort_by: "revenue.desc",
        "vote_count.gte": 20,
        region: region === "ALL" ? undefined : region,
      };
      const fallbackDiscover = await tmdbFetch<{ results: TmdbMovie[] }>("/discover/movie", fallbackParams);
      ranked = fallbackDiscover.results.slice(0, limit).map((movie) => ({ ...movie, revenue: 0 }));
    } catch {
      const nowPlayingFallback = await tmdbFetch<{ results: TmdbMovie[] }>("/movie/now_playing", {
        language: normalizedLanguage,
        page: 1,
        region: region === "ALL" ? undefined : region,
      });
      ranked = nowPlayingFallback.results.slice(0, limit).map((movie) => ({ ...movie, revenue: 0 }));
    }
  }

  return ranked.map((movie, index) => {
    const revenue = movie.revenue ?? 0;
    const previousRevenue = index > 0 ? ranked[index - 1]?.revenue ?? 0 : 0;
    return {
      id: movie.id,
      place: `${index + 1} место`,
      title: movie.title,
      amount: revenue > 0 ? formatUsdCurrency(revenue, normalizedLanguage) : "Нет данных",
      change: index === 0 ? "—" : formatDeltaPercent(revenue, previousRevenue),
      image: movie.poster_path ? `${ctx.base}${ctx.posterSize}${movie.poster_path}` : FALLBACK_POSTER,
    };
  });
}

function normalizeVideoType(type: string) {
  const normalized = type.trim().toLowerCase();
  if (normalized === "official trailer") {
    return "trailer";
  }
  return normalized;
}

async function getMovieTrailerVideo(
  movieId: number,
  language: SiteLanguage = "ru-RU",
  options?: { trailerType?: "all" | "trailer" | "teaser" | "clip"; officialOnly?: boolean }
): Promise<TmdbVideo | undefined> {
  // сначала пробуем выбранный язык, если нет — берём английский
  const normalizedLanguage = normalizeSiteLanguage(language);
  const attempt = async (lang: string) =>
    tmdbFetch<TmdbVideosResponse>(`/movie/${movieId}/videos`, { language: lang }, 60 * 30);

  const [primary, en] = await Promise.allSettled([attempt(normalizedLanguage), attempt("en-US")]);
  const primaryVideos = primary.status === "fulfilled" ? primary.value.results : [];
  const enVideos = en.status === "fulfilled" ? en.value.results : [];
  const videos = [...primaryVideos, ...enVideos];

  const filtered = videos.filter((video) => {
    if (video.site !== "YouTube") {
      return false;
    }
    if (options?.officialOnly && !video.official) {
      return false;
    }
    if (!options?.trailerType || options.trailerType === "all") {
      return true;
    }
    return normalizeVideoType(video.type) === options.trailerType;
  });

  return (
    filtered.find((video) => normalizeVideoType(video.type) === "trailer" && video.official) ||
    filtered.find((video) => normalizeVideoType(video.type) === "trailer") ||
    filtered.find((video) => normalizeVideoType(video.type) === "teaser") ||
    filtered[0]
  );
}

export async function getWeeklyTrailers(limit = 6, language: SiteLanguage = "ru-RU"): Promise<Trailer[]> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const ctx = await getAssetsContext(normalizedLanguage);
  const { results: movies } = await tmdbFetch<{ results: TmdbMovie[] }>("/trending/movie/week", {
    language: normalizedLanguage,
    page: 1,
  });

  const picks = movies.slice(0, limit * 2); // небольшой запас, если у части фильмов нет трейлера

  const trailers: Trailer[] = [];
  for (const movie of picks) {
    if (trailers.length >= limit) break;
    const video = await getMovieTrailerVideo(movie.id, normalizedLanguage);
    if (!video) continue;

    const imagePath = movie.backdrop_path ?? movie.poster_path;
    trailers.push({
      title: video.name || movie.title,
      time: video.type || "Трейлер",
      note: video.official ? "Официальный" : undefined,
      movieId: movie.id,
      trailerKey: video.key,
      image: imagePath ? `${ctx.base}${ctx.backdropSize}${imagePath}` : FALLBACK_BACKDROP,
    });
  }

  while (trailers.length < limit) {
    trailers.push({
      title: ctx.labels.trailerSoonTitle,
      time: ctx.labels.trailerLabel,
      image: FALLBACK_BACKDROP,
    });
  }

  return trailers.slice(0, limit);
}

function mapTrailerCatalogItem(
  movie: TmdbMovie,
  video: TmdbVideo,
  ctx: Awaited<ReturnType<typeof getAssetsContext>>
): TmdbTrailerCatalogItem {
  const imagePath = movie.backdrop_path ?? movie.poster_path;
  return {
    movieId: movie.id,
    movieTitle: movie.title,
    trailerKey: video.key,
    title: video.name || movie.title,
    type: video.type || "Trailer",
    official: Boolean(video.official),
    publishedAt: video.published_at,
    image: imagePath ? `${ctx.base}${ctx.backdropSize}${imagePath}` : FALLBACK_BACKDROP,
  };
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export async function getTrailersCatalog(input: TrailerCatalogInput = {}): Promise<TrailerCatalogResult> {
  const normalizedLanguage = normalizeSiteLanguage(input.language);
  const trailerType = input.trailerType ?? "all";
  const officialOnly = Boolean(input.officialOnly);
  const page =
    Number.isFinite(input.page) && Number(input.page) > 0
      ? Math.trunc(Number(input.page))
      : 1;
  const limit =
    Number.isFinite(input.limit) && Number(input.limit) > 0
      ? Math.min(24, Math.trunc(Number(input.limit)))
      : 12;

  const startIndex = (page - 1) * limit;
  const targetCount = startIndex + limit + 1;
  const maxMoviePages = Math.min(30, page * 4 + 6);
  const concurrency = 5;

  const ctx = await getAssetsContext(normalizedLanguage);
  const items: TmdbTrailerCatalogItem[] = [];

  for (let moviePage = 1; moviePage <= maxMoviePages && items.length < targetCount; moviePage += 1) {
    const response = await tmdbFetch<TmdbPagedResponse<TmdbMovie>>("/trending/movie/week", {
      language: normalizedLanguage,
      page: moviePage,
    });
    const movies = response.results ?? [];
    if (!movies.length) {
      break;
    }

    for (const movieChunk of chunkArray(movies, concurrency)) {
      if (items.length >= targetCount) {
        break;
      }

      const mappedChunk = await Promise.all(
        movieChunk.map(async (movie) => {
          const trailerVideoFiltered = await getMovieTrailerVideo(movie.id, normalizedLanguage, {
            trailerType,
            officialOnly,
          });
          if (!trailerVideoFiltered) {
            return null;
          }
          return mapTrailerCatalogItem(movie, trailerVideoFiltered, ctx);
        })
      );

      for (const item of mappedChunk) {
        if (!item) {
          continue;
        }
        items.push(item);
      }
    }

    if (movies.length < 20) {
      break;
    }
  }

  const pageItems = items.slice(startIndex, startIndex + limit);
  return {
    items: pageItems,
    page,
    hasMore: items.length > startIndex + limit,
  };
}

export async function getFeaturedTrailerHero(language: SiteLanguage = "ru-RU"): Promise<TrailerHero | null> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const ctx = await getAssetsContext(normalizedLanguage);
  const { results: movies } = await tmdbFetch<{ results: TmdbMovie[] }>("/trending/movie/week", {
    language: normalizedLanguage,
    page: 1,
  });

  for (const movie of movies) {
    const details = await tmdbFetch<
      TmdbMovie & {
        runtime?: number;
        videos: TmdbVideosResponse;
        credits?: { cast?: TmdbCastMember[] };
      }
    >(`/movie/${movie.id}`, { language: normalizedLanguage, append_to_response: "videos,credits" }, 60 * 30);

    const video =
      details.videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
      details.videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
      details.videos.results.find((v) => v.site === "YouTube");

    if (!video) continue;

    const imagePath = details.backdrop_path ?? details.poster_path;
    const durationMinutes = details.runtime ?? movie.runtime;
    const duration =
      typeof durationMinutes === "number" && durationMinutes > 0
        ? `${Math.floor(durationMinutes / 60)}:${String(durationMinutes % 60).padStart(2, "0")}`
        : "Трейлер";

    const actors =
      details.credits?.cast
        ?.slice(0, 2)
        .map((actor) => ({
          name: actor.name,
          role: actor.character || ctx.labels.actorFallback,
          avatar: actor.profile_path
            ? `${ctx.base}${ctx.profileSize}${actor.profile_path}`
            : FALLBACK_AVATAR,
        })) ?? [];

    return {
      title: movie.title,
      description: details.overview || movie.overview || "Официальный трейлер",
      image: imagePath ? `${ctx.base}${ctx.backdropSize}${imagePath}` : FALLBACK_BACKDROP,
      duration,
      tag: ctx.labels.trailerWeekTag,
      movieId: movie.id,
      trailerKey: video.key,
      actors,
    };
  }

  return null;
}

type TmdbMovieImage = {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
};

type TmdbMovieDetails = TmdbMovie & {
  original_title?: string;
  original_language?: string;
  tagline?: string;
  status?: string;
  homepage?: string;
  popularity?: number;
  vote_count?: number;
  budget?: number;
  revenue?: number;
  adult?: boolean;
  video?: boolean;
  genres?: { id: number; name: string }[];
  production_companies?: { id: number; name: string; origin_country?: string; logo_path?: string | null }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { iso_639_1: string; english_name: string; name: string }[];
  belongs_to_collection?: { id: number; name: string; poster_path?: string | null; backdrop_path?: string | null } | null;
  credits?: {
    cast?: {
      id: number;
      name: string;
      character?: string;
      profile_path?: string | null;
      order?: number;
    }[];
    crew?: {
      id: number;
      name: string;
      job?: string;
      department?: string;
      profile_path?: string | null;
    }[];
  };
  videos?: TmdbVideosResponse;
  images?: {
    backdrops?: TmdbMovieImage[];
    posters?: TmdbMovieImage[];
    logos?: TmdbMovieImage[];
  };
  keywords?: { keywords?: { id: number; name: string }[] };
  recommendations?: { results: TmdbMovie[] };
  similar?: { results: TmdbMovie[] };
  reviews?: {
    results: {
      id: string;
      author: string;
      content: string;
      created_at?: string;
      url?: string;
      author_details?: {
        name?: string;
        username?: string;
        avatar_path?: string | null;
        rating?: number | null;
      };
    }[];
  };
  "watch/providers"?: {
    results?: Record<
      string,
      {
        link?: string;
        flatrate?: { provider_id: number; provider_name: string; logo_path?: string | null }[];
        rent?: { provider_id: number; provider_name: string; logo_path?: string | null }[];
        buy?: { provider_id: number; provider_name: string; logo_path?: string | null }[];
      }
    >;
  };
  release_dates?: {
    results?: {
      iso_3166_1: string;
      release_dates: {
        certification?: string;
        iso_639_1?: string;
        note?: string;
        release_date: string;
        type: number;
      }[];
    }[];
  };
};

export type MovieFullDetails = {
  id: number;
  title: string;
  originalTitle?: string;
  overview: string;
  tagline?: string;
  poster: string;
  backdrop: string;
  releaseDate?: string;
  year?: number;
  runtime?: number;
  status?: string;
  originalLanguage?: string;
  popularity?: number;
  voteAverage: number;
  voteCount?: number;
  budget?: number;
  revenue?: number;
  adult?: boolean;
  video?: boolean;
  homepage?: string;
  genres: { id: number; name: string }[];
  productionCompanies: { id: number; name: string; originCountry?: string; logo?: string | null }[];
  productionCountries: { code: string; name: string }[];
  spokenLanguages: { code: string; englishName: string; name: string }[];
  collection?: { id: number; name: string; poster?: string | null; backdrop?: string | null } | null;
  cast: { id: number; name: string; character?: string; profile?: string }[];
  crew: { id: number; name: string; job?: string; department?: string; profile?: string }[];
  trailers: { key: string; name: string; type: string; official: boolean; publishedAt?: string }[];
  videos: { key: string; name: string; type: string; site: string; official: boolean; publishedAt?: string }[];
  backdrops: string[];
  posters: string[];
  logos: string[];
  keywords: string[];
  recommendations: Movie[];
  similar: Movie[];
  reviews: { id: string; author: string; content: string; createdAt?: string; url?: string; rating?: number | null }[];
  providersByRegion: {
    region: string;
    link?: string;
    flatrate: string[];
    rent: string[];
    buy: string[];
  }[];
  releaseDates: { region: string; certification?: string; releaseDate: string; type: number }[];
  raw: TmdbMovieDetails;
};

export async function getMovieFullDetails(movieId: number, language: SiteLanguage = "ru-RU"): Promise<MovieFullDetails> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const languageBase = getLanguageBase(normalizedLanguage);
  const ctx = await getAssetsContext(normalizedLanguage);
  const details = await tmdbFetch<TmdbMovieDetails>(
    `/movie/${movieId}`,
    {
      language: normalizedLanguage,
      append_to_response:
        "credits,videos,images,keywords,recommendations,similar,reviews,watch/providers,release_dates",
      include_image_language: `${languageBase},en,null`,
      include_video_language: `${normalizedLanguage},en-US`,
    },
    60 * 30
  );

  const img = (path?: string | null, size?: string) =>
    path ? `${ctx.base}${size ?? ctx.posterSize}${path}` : undefined;

  const recommendations = (details.recommendations?.results ?? [])
    .slice(0, 12)
    .map((movie) => mapMovie(movie, ctx, ctx.labels.recommendationsTag));
  const similar = (details.similar?.results ?? []).slice(0, 12).map((movie) => mapMovie(movie, ctx, ctx.labels.similarTag));

  const videoItems = (details.videos?.results ?? [])
    .filter((video) => video.site === "YouTube")
    .map((video) => ({
      key: video.key,
      name: video.name,
      type: video.type,
      site: video.site,
      official: video.official,
      publishedAt: video.published_at,
    }));

  const providersByRegion = Object.entries(details["watch/providers"]?.results ?? {}).map(([region, data]) => ({
    region,
    link: data.link,
    flatrate: (data.flatrate ?? []).map((provider) => provider.provider_name),
    rent: (data.rent ?? []).map((provider) => provider.provider_name),
    buy: (data.buy ?? []).map((provider) => provider.provider_name),
  }));

  const releaseDates = (details.release_dates?.results ?? []).flatMap((entry) =>
    entry.release_dates.map((release) => ({
      region: entry.iso_3166_1,
      certification: release.certification || undefined,
      releaseDate: release.release_date,
      type: release.type,
    }))
  );

  return {
    id: details.id,
    title: details.title,
    originalTitle: details.original_title || undefined,
    overview: details.overview || "",
    tagline: details.tagline || undefined,
    poster: img(details.poster_path, ctx.posterSize) ?? FALLBACK_POSTER,
    backdrop: img(details.backdrop_path, ctx.backdropSize) ?? FALLBACK_BACKDROP,
    releaseDate: details.release_date,
    year: details.release_date ? new Date(details.release_date).getFullYear() : undefined,
    runtime: details.runtime,
    status: details.status,
    originalLanguage: details.original_language,
    popularity: details.popularity,
    voteAverage: details.vote_average ?? 0,
    voteCount: details.vote_count,
    budget: details.budget,
    revenue: details.revenue,
    adult: details.adult,
    video: details.video,
    homepage: details.homepage || undefined,
    genres: details.genres ?? [],
    productionCompanies: (details.production_companies ?? []).map((company) => ({
      id: company.id,
      name: company.name,
      originCountry: company.origin_country || undefined,
      logo: img(company.logo_path ?? null, ctx.profileSize),
    })),
    productionCountries: (details.production_countries ?? []).map((country) => ({
      code: country.iso_3166_1,
      name: country.name,
    })),
    spokenLanguages: (details.spoken_languages ?? []).map((lang) => ({
      code: lang.iso_639_1,
      englishName: lang.english_name,
      name: lang.name,
    })),
    collection: details.belongs_to_collection
      ? {
          id: details.belongs_to_collection.id,
          name: details.belongs_to_collection.name,
          poster: img(details.belongs_to_collection.poster_path ?? null, ctx.posterSize),
          backdrop: img(details.belongs_to_collection.backdrop_path ?? null, ctx.backdropSize),
        }
      : null,
    cast: (details.credits?.cast ?? []).slice(0, 24).map((actor) => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile: img(actor.profile_path ?? null, ctx.profileSize) ?? FALLBACK_AVATAR,
    })),
    crew: (details.credits?.crew ?? []).slice(0, 24).map((member) => ({
      id: member.id,
      name: member.name,
      job: member.job,
      department: member.department,
      profile: img(member.profile_path ?? null, ctx.profileSize) ?? FALLBACK_AVATAR,
    })),
    trailers: videoItems.filter((video) => video.type === "Trailer" || video.type === "Teaser"),
    videos: videoItems,
    backdrops: (details.images?.backdrops ?? []).slice(0, 24).map((image) => `${ctx.base}${ctx.backdropSize}${image.file_path}`),
    posters: (details.images?.posters ?? []).slice(0, 24).map((image) => `${ctx.base}${ctx.posterSize}${image.file_path}`),
    logos: (details.images?.logos ?? []).slice(0, 24).map((image) => `${ctx.base}${ctx.profileSize}${image.file_path}`),
    keywords: (details.keywords?.keywords ?? []).map((keyword) => keyword.name),
    recommendations,
    similar,
    reviews: (details.reviews?.results ?? []).slice(0, 10).map((review) => ({
      id: review.id,
      author: review.author,
      content: review.content,
      createdAt: review.created_at,
      url: review.url,
      rating: review.author_details?.rating ?? null,
    })),
    providersByRegion,
    releaseDates,
    raw: details,
  };
}

type TmdbPersonMovieCredit = {
  id: number;
  title?: string;
  character?: string;
  job?: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
  popularity?: number;
};

type TmdbPersonDetails = {
  id: number;
  name: string;
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  known_for_department?: string;
  popularity?: number;
  profile_path?: string | null;
  also_known_as?: string[];
  homepage?: string | null;
  imdb_id?: string | null;
  movie_credits?: {
    cast?: TmdbPersonMovieCredit[];
    crew?: TmdbPersonMovieCredit[];
  };
  images?: {
    profiles?: { file_path: string }[];
  };
  external_ids?: {
    imdb_id?: string | null;
    instagram_id?: string | null;
    twitter_id?: string | null;
    facebook_id?: string | null;
    tiktok_id?: string | null;
    youtube_id?: string | null;
  };
};

export type TmdbPersonCredit = {
  id: number;
  title: string;
  year?: number;
  character?: string;
  job?: string;
  poster: string;
  rating: number;
  overview: string;
};

export type PersonFullDetails = {
  id: number;
  name: string;
  biography: string;
  birthday?: string;
  deathday?: string;
  placeOfBirth?: string;
  department?: string;
  popularity?: number;
  profile: string;
  knownAs: string[];
  homepage?: string;
  imdbId?: string;
  social: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  knownFor: TmdbPersonCredit[];
  castCredits: TmdbPersonCredit[];
  crewCredits: TmdbPersonCredit[];
  images: string[];
  raw: TmdbPersonDetails;
};

function getReleaseTimestamp(date?: string) {
  if (!date) {
    return 0;
  }
  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function mapPersonCredit(
  credit: TmdbPersonMovieCredit,
  ctx: Awaited<ReturnType<typeof getImageAssetsContext>>
): TmdbPersonCredit {
  return {
    id: credit.id,
    title: credit.title || "Без названия",
    year: credit.release_date ? new Date(credit.release_date).getFullYear() : undefined,
    character: credit.character || undefined,
    job: credit.job || undefined,
    poster: credit.poster_path ? `${ctx.base}${ctx.posterSize}${credit.poster_path}` : FALLBACK_POSTER,
    rating: Number(credit.vote_average?.toFixed(1)) || 0,
    overview: credit.overview || "",
  };
}

function sortPersonCredits(a: TmdbPersonMovieCredit, b: TmdbPersonMovieCredit) {
  const byDate = getReleaseTimestamp(b.release_date) - getReleaseTimestamp(a.release_date);
  if (byDate !== 0) {
    return byDate;
  }
  const byPopularity = (b.popularity ?? 0) - (a.popularity ?? 0);
  if (byPopularity !== 0) {
    return byPopularity;
  }
  return (b.vote_average ?? 0) - (a.vote_average ?? 0);
}

function uniqueCreditsByMovieId(credits: TmdbPersonMovieCredit[]) {
  const seen = new Set<number>();
  return credits.filter((credit) => {
    if (!Number.isFinite(credit.id) || seen.has(credit.id)) {
      return false;
    }
    seen.add(credit.id);
    return true;
  });
}

export async function getPersonFullDetails(personId: number, language: SiteLanguage = "ru-RU"): Promise<PersonFullDetails> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const languageBase = getLanguageBase(normalizedLanguage);
  const [ctx, details] = await Promise.all([
    getImageAssetsContext(),
    tmdbFetch<TmdbPersonDetails>(
      `/person/${personId}`,
      {
        language: normalizedLanguage,
        append_to_response: "movie_credits,images,external_ids",
        include_image_language: `${languageBase},en,null`,
      },
      60 * 30
    ),
  ]);

  const castCreditsRaw = [...(details.movie_credits?.cast ?? [])].sort(sortPersonCredits);
  const crewCreditsRaw = [...(details.movie_credits?.crew ?? [])].sort(sortPersonCredits);
  const knownForRaw = uniqueCreditsByMovieId(castCreditsRaw).slice(0, 12);

  return {
    id: details.id,
    name: details.name,
    biography: details.biography?.trim() || "Биография пока недоступна.",
    birthday: details.birthday || undefined,
    deathday: details.deathday || undefined,
    placeOfBirth: details.place_of_birth || undefined,
    department: details.known_for_department || undefined,
    popularity: details.popularity,
    profile: details.profile_path ? `${ctx.base}${ctx.profileSize}${details.profile_path}` : FALLBACK_AVATAR,
    knownAs: details.also_known_as ?? [],
    homepage: details.homepage || undefined,
    imdbId: details.imdb_id || details.external_ids?.imdb_id || undefined,
    social: {
      instagram: details.external_ids?.instagram_id || undefined,
      twitter: details.external_ids?.twitter_id || undefined,
      facebook: details.external_ids?.facebook_id || undefined,
      tiktok: details.external_ids?.tiktok_id || undefined,
      youtube: details.external_ids?.youtube_id || undefined,
    },
    knownFor: knownForRaw.map((credit) => mapPersonCredit(credit, ctx)),
    castCredits: castCreditsRaw.slice(0, 24).map((credit) => mapPersonCredit(credit, ctx)),
    crewCredits: crewCreditsRaw.slice(0, 24).map((credit) => mapPersonCredit(credit, ctx)),
    images: (details.images?.profiles ?? [])
      .slice(0, 24)
      .map((image) => `${ctx.base}${ctx.profileSize}${image.file_path}`),
    raw: details,
  };
}

export async function getPopularPeople(limit = 10, page = 1, language: SiteLanguage = "ru-RU"): Promise<Person[]> {
  const labels = getTmdbLocalizedLabels(language);
  const catalog = await getCatalogPeople({ page, sortBy: "popularity.desc", language });

  return catalog.items.slice(0, limit).map((person) => {
    const knownTitle = person.knownFor[0] || "Знаковая роль";
    const delta = `+${Math.round((person.popularity ?? 0) * 10)}`;

    return {
      id: person.id,
      name: person.name,
      role: person.department || labels.actorFallback,
      knownFor: knownTitle,
      delta,
      image: person.profile,
    };
  });
}


