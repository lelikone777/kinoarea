import { NextResponse } from "next/server";
import { getCatalogPeople, isTmdbReachable } from "@/app/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page") || "1");
  const sortByParam = searchParams.get("sortBy");

  const sortBy = sortByParam === "popularity.desc" ? sortByParam : "popularity.desc";

  try {
    const tmdbAvailable = await isTmdbReachable();
    if (!tmdbAvailable) {
      return NextResponse.json({ error: "TMDB недоступен: DNS резолвит API в localhost." }, { status: 503 });
    }

    const people = await getCatalogPeople({
      query,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      sortBy,
    });

    return NextResponse.json(people);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load TMDB people";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
