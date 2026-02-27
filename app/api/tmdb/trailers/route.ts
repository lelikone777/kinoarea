import { NextResponse } from "next/server";
import { getTrailersCatalog } from "@/app/lib/tmdb";
import { normalizeSiteLanguage } from "@/app/lib/language";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") ?? "12", 10);
    const language = normalizeSiteLanguage(searchParams.get("language"));
    const trailerTypeRaw = (searchParams.get("trailerType") ?? "all").toLowerCase();
    const trailerType =
      trailerTypeRaw === "trailer" || trailerTypeRaw === "teaser" || trailerTypeRaw === "clip"
        ? trailerTypeRaw
        : "all";
    const officialOnly = searchParams.get("officialOnly") === "1";

    const result = await getTrailersCatalog({ page, limit, language, trailerType, officialOnly });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load trailers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
