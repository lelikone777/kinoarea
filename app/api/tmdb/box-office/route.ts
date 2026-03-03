import { NextResponse } from "next/server";
import { normalizeSiteLanguage } from "@/app/lib/language";
import {
  getBoxOfficeMovies,
  type TmdbBoxOfficePeriod,
  type TmdbBoxOfficeReleaseType,
  type TmdbBoxOfficeSortBy,
} from "@/app/lib/tmdb";

const ALLOWED_PERIODS = new Set<TmdbBoxOfficePeriod>(["weekend", "month", "year", "all"]);
const ALLOWED_SORTS = new Set<TmdbBoxOfficeSortBy>([
  "revenue.desc",
  "popularity.desc",
  "vote_average.desc",
  "release_date.desc",
]);
const ALLOWED_RELEASE_TYPES = new Set<TmdbBoxOfficeReleaseType>(["all", "theatrical"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = normalizeSiteLanguage(searchParams.get("language"));
  const periodParam = searchParams.get("period") as TmdbBoxOfficePeriod | null;
  const sortParam = searchParams.get("sortBy") as TmdbBoxOfficeSortBy | null;
  const releaseTypeParam = searchParams.get("releaseType") as TmdbBoxOfficeReleaseType | null;
  const regionParam = (searchParams.get("region") || "RU").toUpperCase();
  const genreId = Number(searchParams.get("genreId") || "");
  const limit = Number(searchParams.get("limit") || "6");
  const originalLanguage = searchParams.get("originalLanguage") || undefined;

  const period = periodParam && ALLOWED_PERIODS.has(periodParam) ? periodParam : "weekend";
  const sortBy = sortParam && ALLOWED_SORTS.has(sortParam) ? sortParam : "revenue.desc";
  const releaseType =
    releaseTypeParam && ALLOWED_RELEASE_TYPES.has(releaseTypeParam) ? releaseTypeParam : "theatrical";

  try {
    const items = await getBoxOfficeMovies({
      language,
      period,
      sortBy,
      region: regionParam,
      genreId: Number.isFinite(genreId) && genreId > 0 ? genreId : undefined,
      originalLanguage,
      releaseType,
      limit: Number.isFinite(limit) && limit > 0 ? Math.min(12, Math.trunc(limit)) : 6,
    });
    return NextResponse.json({ items });
  } catch (error) {
    try {
      const fallbackItems = await getBoxOfficeMovies({
        language,
        period: "weekend",
        sortBy,
        region: regionParam,
        releaseType,
        limit: Number.isFinite(limit) && limit > 0 ? Math.min(12, Math.trunc(limit)) : 6,
      });
      return NextResponse.json({ items: fallbackItems, fallback: true });
    } catch {
      const message = error instanceof Error ? error.message : "Failed to load box office";
      return NextResponse.json({ items: [], fallback: true, error: message });
    }
  }
}
