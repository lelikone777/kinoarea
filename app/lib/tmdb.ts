import type { Movie, Trailer } from "../data/content";
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
  release_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
};

type TmdbGenreResponse = {
  genres: { id: number; name: string }[];
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

function getAuthHeader() {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new Error("TMDB_ACCESS_TOKEN is not set in environment");
  }
  return { Authorization: `Bearer ${token}` };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 60 * 10
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}): ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

export async function getTmdbConfiguration() {
  return tmdbFetch<TmdbConfigResponse>("/configuration", {}, 60 * 60 * 24);
}

async function getGenresMap() {
  const { genres } = await tmdbFetch<TmdbGenreResponse>(
    "/genre/movie/list",
    { language: "ru-RU" },
    60 * 60 * 24
  );
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
    title: movie.title,
    genre: genreNames || (year ? `Премьера ${year}` : "Фильм"),
    rating: Number(movie.vote_average?.toFixed(1)) || 0,
    tag,
    image: movie.poster_path ? `${ctx.base}${ctx.posterSize}${movie.poster_path}` : FALLBACK_POSTER,
  };
}

export async function getPopularMovies(limit = 6): Promise<Movie[]> {
  const ctx = await getAssetsContext();
  const { results } = await tmdbFetch<{ results: TmdbMovie[] }>("/movie/popular", {
    language: "ru-RU",
    region: "RU",
    page: 1,
  });
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
