import { NextResponse } from "next/server";
import { searchImdbMovies } from "../../../lib/imdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const year = Number(searchParams.get("year") || "");
  const typeParam = searchParams.get("type");
  const page = Number(searchParams.get("page") || "1");

  const type = typeParam === "movie" || typeParam === "series" ? typeParam : undefined;

  try {
    const data = await searchImdbMovies({
      query,
      year: Number.isFinite(year) ? year : undefined,
      type,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch IMDb search";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
