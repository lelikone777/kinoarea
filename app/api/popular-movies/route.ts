import { NextResponse } from "next/server";
import { getPopularMovies, isTmdbReachable } from "../../lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const limitParam = searchParams.get("limit");

  const year = yearParam ? Number(yearParam) : undefined;
  const limit = limitParam ? Number(limitParam) : 40;

  try {
    const tmdbAvailable = await isTmdbReachable();
    if (!tmdbAvailable) {
      return NextResponse.json({ error: "TMDB недоступен: DNS резолвит API в localhost." }, { status: 503 });
    }

    const movies = await getPopularMovies(limit, Number.isFinite(year) ? year : undefined);
    return NextResponse.json({ movies });
  } catch {
    return NextResponse.json({ error: "Failed to load popular movies" }, { status: 500 });
  }
}

