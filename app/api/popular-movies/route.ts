import { NextResponse } from "next/server";
import { getPopularMovies } from "../../lib/tmdb";
import { normalizeSiteLanguage } from "../../lib/language";
import { popularMovies } from "../../data/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const limitParam = searchParams.get("limit");
  const language = normalizeSiteLanguage(searchParams.get("language"));

  const year = yearParam ? Number(yearParam) : undefined;
  const parsedLimit = limitParam ? Number(limitParam) : 40;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : 40;
  const normalizedYear = Number.isFinite(year) ? year : undefined;

  const fallbackMovies = () => {
    const base = normalizedYear
      ? popularMovies.filter((movie) => movie.year === normalizedYear)
      : popularMovies;
    return base.slice(0, limit);
  };

  const hasTmdbAuth = Boolean(process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_API_KEY);
  if (!hasTmdbAuth) {
    return NextResponse.json({ movies: fallbackMovies() });
  }

  try {
    const movies = await getPopularMovies(limit, normalizedYear, language);
    return NextResponse.json({ movies });
  } catch {
    return NextResponse.json({ movies: fallbackMovies() });
  }
}
