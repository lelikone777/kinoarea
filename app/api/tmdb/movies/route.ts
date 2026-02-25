import { NextResponse } from "next/server";
import { getCatalogMovies, getMovieGenres } from "../../../lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const year = Number(searchParams.get("year") || "");
  const genreId = Number(searchParams.get("genreId") || "");
  const page = Number(searchParams.get("page") || "1");
  const sortByParam = searchParams.get("sortBy");

  const sortBy =
    sortByParam === "vote_average.desc" ||
    sortByParam === "release_date.desc" ||
    sortByParam === "revenue.desc" ||
    sortByParam === "popularity.desc"
      ? sortByParam
      : "popularity.desc";

  try {
    const [movies, genres] = await Promise.all([
      getCatalogMovies({
        query,
        year: Number.isFinite(year) && year > 1800 ? year : undefined,
        genreId: Number.isFinite(genreId) && genreId > 0 ? genreId : undefined,
        page: Number.isFinite(page) && page > 0 ? page : 1,
        sortBy,
      }),
      getMovieGenres(),
    ]);

    return NextResponse.json({ ...movies, genres });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load TMDB movies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
