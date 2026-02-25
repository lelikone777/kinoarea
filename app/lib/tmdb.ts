import type { Movie, Person, Trailer } from "../data/content";
import type { TrailerHero } from "../components/sections/TrailersSection";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";
const FALLBACK_BACKDROP =
  "https://images.unsplash.com/photo-1463107971871-fbac9ddb920f?auto=format&fit=crop&w=1280&q=80";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80";

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
  | "vote_average.desc"
  | "release_date.desc"
  | "revenue.desc";

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
};

type CatalogMoviesResult = {
  items: TmdbCatalogMovie[];
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

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 60 * 10
): Promise<T> {
  const auth = resolveTmdbAuth();
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  if (auth.apiKey) {
    url.searchParams.set("api_key", auth.apiKey);
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

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
      throw new Error(hint, { cause: error as Error });
    }
    throw error;
  }

  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}): ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

export async function getTmdbConfiguration() {
  return tmdbFetch<TmdbConfigResponse>("/configuration", {}, 60 * 60 * 24);
}

export async function getMovieGenres(): Promise<TmdbGenre[]> {
  const { genres } = await tmdbFetch<TmdbGenreResponse>(
    "/genre/movie/list",
    { language: "ru-RU" },
    60 * 60 * 24
  );
  return genres;
}

async function getGenresMap() {
  const genres = await getMovieGenres();
  return new Map(genres.map((genre) => [genre.id, genre.name]));
}

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

async function getAssetsContext() {
  const [config, genresMap] = await Promise.all([getTmdbConfiguration(), getGenresMap()]);
  const base = config.images.secure_base_url || "https://image.tmdb.org/t/p/";
  const posterSize = pickPosterSize(config.images.poster_sizes);
  const backdropSize = pickBackdropSize(config.images.backdrop_sizes);
  const profileSize = pickProfileSize(config.images.profile_sizes);
  return { base, posterSize, backdropSize, profileSize, genresMap };
}

function mapMovie(movie: TmdbMovie, ctx: Awaited<ReturnType<typeof getAssetsContext>>, tag?: string): Movie {
  const genreNames = movie.genre_ids.map((id) => ctx.genresMap.get(id)).filter(Boolean).join(", ");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;

  return {
    id: movie.id,
    title: movie.title,
    genre: genreNames || (year ? `Премьера ${year}` : "Фильм"),
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

  const ctx = await getAssetsContext();
  const isSearch = query.length > 0;
  const params: Record<string, string | number | undefined> = {
    language: "ru-RU",
    page,
    include_adult: "false",
  };

  let endpoint = "/discover/movie";
  if (isSearch) {
    endpoint = "/search/movie";
    params.query = query;
    params.primary_release_year = year;
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

export async function getPopularMovies(limit = 6, year?: number): Promise<Movie[]> {
  const ctx = await getAssetsContext();
  const endpoint = year ? "/discover/movie" : "/movie/popular";
  const params: Record<string, string | number> = {
    language: "ru-RU",
    region: "RU",
    sort_by: "popularity.desc",
    page: 1,
  };
  if (year) {
    params.primary_release_year = year;
  }

  const { results } = await tmdbFetch<{ results: TmdbMovie[] }>(endpoint, params);
  return results.slice(0, limit).map((movie) => mapMovie(movie, ctx, "Популярное"));
}

export async function getNowPlayingMovies(limit = 12): Promise<Movie[]> {
  const ctx = await getAssetsContext();
  const { results } = await tmdbFetch<{ results: TmdbMovie[] }>("/movie/now_playing", {
    language: "ru-RU",
    region: "RU",
    page: 1,
  });
  return results.slice(0, limit).map((movie) => mapMovie(movie, ctx, "Сейчас в кино"));
}

export async function getUpcomingMovies(limit = 8): Promise<Movie[]> {
  const ctx = await getAssetsContext();
  const { results } = await tmdbFetch<{ results: TmdbMovie[] }>("/movie/upcoming", {
    language: "ru-RU",
    region: "RU",
    page: 1,
  });
  return results.slice(0, limit).map((movie) => mapMovie(movie, ctx, "Скоро"));
}

async function getMovieTrailerVideo(movieId: number): Promise<TmdbVideo | undefined> {
  // пробуем на русском, если нет — берём английский
  const attempt = async (lang: string) =>
    tmdbFetch<TmdbVideosResponse>(`/movie/${movieId}/videos`, { language: lang }, 60 * 30);

  const [ru, en] = await Promise.allSettled([attempt("ru-RU"), attempt("en-US")]);
  const ruVideos = ru.status === "fulfilled" ? ru.value.results : [];
  const enVideos = en.status === "fulfilled" ? en.value.results : [];
  const videos = [...ruVideos, ...enVideos];

  return (
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser")
  );
}

export async function getWeeklyTrailers(limit = 6): Promise<Trailer[]> {
  const ctx = await getAssetsContext();
  const { results: movies } = await tmdbFetch<{ results: TmdbMovie[] }>("/trending/movie/week", {
    language: "ru-RU",
    page: 1,
  });

  const picks = movies.slice(0, limit * 2); // небольшой запас, если у части фильмов нет трейлера

  const trailers: Trailer[] = [];
  for (const movie of picks) {
    if (trailers.length >= limit) break;
    const video = await getMovieTrailerVideo(movie.id);
    if (!video) continue;

    const imagePath = movie.backdrop_path ?? movie.poster_path;
    trailers.push({
      title: video.name || movie.title,
      time: video.type || "Трейлер",
      note: video.official ? "Официальный" : undefined,
      image: imagePath ? `${ctx.base}${ctx.backdropSize}${imagePath}` : FALLBACK_BACKDROP,
    });
  }

  while (trailers.length < limit) {
    trailers.push({
      title: "Трейлер скоро",
      time: "Трейлер",
      image: FALLBACK_BACKDROP,
    });
  }

  return trailers.slice(0, limit);
}

export async function getFeaturedTrailerHero(): Promise<TrailerHero | null> {
  const ctx = await getAssetsContext();
  const { results: movies } = await tmdbFetch<{ results: TmdbMovie[] }>("/trending/movie/week", {
    language: "ru-RU",
    page: 1,
  });

  for (const movie of movies) {
    const details = await tmdbFetch<
      TmdbMovie & {
        runtime?: number;
        videos: TmdbVideosResponse;
        credits?: { cast?: TmdbCastMember[] };
      }
    >(`/movie/${movie.id}`, { language: "ru-RU", append_to_response: "videos,credits" }, 60 * 30);

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
          role: actor.character || "Актёр",
          avatar: actor.profile_path
            ? `${ctx.base}${ctx.profileSize}${actor.profile_path}`
            : FALLBACK_AVATAR,
        })) ?? [];

    return {
      title: movie.title,
      description: details.overview || movie.overview || "Официальный трейлер",
      image: imagePath ? `${ctx.base}${ctx.backdropSize}${imagePath}` : FALLBACK_BACKDROP,
      duration,
      tag: "Трейлер недели",
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

export async function getMovieFullDetails(movieId: number): Promise<MovieFullDetails> {
  const ctx = await getAssetsContext();
  const details = await tmdbFetch<TmdbMovieDetails>(
    `/movie/${movieId}`,
    {
      language: "ru-RU",
      append_to_response:
        "credits,videos,images,keywords,recommendations,similar,reviews,watch/providers,release_dates",
      include_image_language: "ru,en,null",
      include_video_language: "ru-RU,en-US",
    },
    60 * 30
  );

  const img = (path?: string | null, size?: string) =>
    path ? `${ctx.base}${size ?? ctx.posterSize}${path}` : undefined;

  const recommendations = (details.recommendations?.results ?? [])
    .slice(0, 12)
    .map((movie) => mapMovie(movie, ctx, "Рекомендации"));
  const similar = (details.similar?.results ?? []).slice(0, 12).map((movie) => mapMovie(movie, ctx, "Похожее"));

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

type TmdbPerson = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  popularity: number;
  known_for?: { title?: string; name?: string; media_type?: string }[];
};

export async function getPopularPeople(limit = 10, page = 1): Promise<Person[]> {
  const ctx = await getAssetsContext();
  const { results } = await tmdbFetch<{ results: TmdbPerson[] }>("/person/popular", {
    language: "ru-RU",
    page,
  });

  return results.slice(0, limit).map((person) => {
    const knownFor = person.known_for?.[0];
    const knownTitle = knownFor?.title || knownFor?.name || "Знаковая роль";
    const department = person.known_for_department || "Актёр";
    const delta = `+${Math.round(person.popularity * 10)}`;

    return {
      name: person.name,
      role: department,
      knownFor: knownTitle,
      delta,
      image: person.profile_path ? `${ctx.base}${ctx.profileSize}${person.profile_path}` : FALLBACK_AVATAR,
    };
  });
}
