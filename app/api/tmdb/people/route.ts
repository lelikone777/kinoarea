import { NextResponse } from "next/server";
import { getCatalogPeople, isTmdbReachable } from "@/app/lib/tmdb";
import { normalizeSiteLanguage } from "@/app/lib/language";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page") || "1");
  const sortByParam = searchParams.get("sortBy");
  const language = normalizeSiteLanguage(searchParams.get("language"));

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
      language,
    });

    return NextResponse.json(people);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load TMDB people";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

