export type ImdbSearchItem = {
  id: string;
  title: string;
  year: string;
  type: string;
  poster: string;
};

export type ImdbMovieDetails = {
  id: string;
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  ratings: { source: string; value: string }[];
  imdbRating: string;
  imdbVotes: string;
  boxOffice: string;
  production: string;
  website: string;
  type: string;
};

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";

function getOmdbApiKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    throw new Error("OMDB_API_KEY is not set");
  }
  return key;
}

async function omdbFetch(params: Record<string, string | number | undefined>) {
  const apiKey = getOmdbApiKey();
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 30 },
  });

  if (!res.ok) {
    throw new Error(`OMDb request failed (${res.status})`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  if (data.Response === "False") {
    throw new Error(String(data.Error || "OMDb returned an error"));
  }

  return data;
}

export async function searchImdbMovies(input: {
  query: string;
  year?: number;
  type?: "movie" | "series";
  page?: number;
}) {
  const query = input.query.trim();
  if (!query) return { items: [] as ImdbSearchItem[], totalResults: 0 };

  const data = (await omdbFetch({
    s: query,
    y: input.year,
    type: input.type,
    page: input.page ?? 1,
  })) as {
    Search?: {
      imdbID: string;
      Title: string;
      Year: string;
      Type: string;
      Poster: string;
    }[];
    totalResults?: string;
  };

  const items =
    data.Search?.map((movie) => ({
      id: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      type: movie.Type,
      poster: movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER,
    })) ?? [];

  return {
    items,
    totalResults: Number(data.totalResults || 0),
  };
}

export async function getImdbMovieDetails(imdbId: string): Promise<ImdbMovieDetails> {
  const data = (await omdbFetch({ i: imdbId, plot: "full" })) as Record<string, unknown> & {
    Ratings?: { Source: string; Value: string }[];
  };

  return {
    id: String(data.imdbID ?? imdbId),
    title: String(data.Title ?? "Без названия"),
    year: String(data.Year ?? "—"),
    rated: String(data.Rated ?? "—"),
    released: String(data.Released ?? "—"),
    runtime: String(data.Runtime ?? "—"),
    genre: String(data.Genre ?? "—"),
    director: String(data.Director ?? "—"),
    writer: String(data.Writer ?? "—"),
    actors: String(data.Actors ?? "—"),
    plot: String(data.Plot ?? "Описание недоступно"),
    language: String(data.Language ?? "—"),
    country: String(data.Country ?? "—"),
    awards: String(data.Awards ?? "—"),
    poster:
      typeof data.Poster === "string" && data.Poster !== "N/A" ? String(data.Poster) : FALLBACK_POSTER,
    ratings:
      data.Ratings?.map((rating) => ({
        source: rating.Source,
        value: rating.Value,
      })) ?? [],
    imdbRating: String(data.imdbRating ?? "—"),
    imdbVotes: String(data.imdbVotes ?? "—"),
    boxOffice: String(data.BoxOffice ?? "—"),
    production: String(data.Production ?? "—"),
    website: String(data.Website ?? "—"),
    type: String(data.Type ?? "movie"),
  };
}
