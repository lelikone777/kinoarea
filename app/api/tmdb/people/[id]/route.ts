import { NextResponse } from "next/server";
import { getPersonFullDetails, isTmdbReachable } from "@/app/lib/tmdb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const personId = Number(id);

  if (!Number.isFinite(personId) || personId <= 0) {
    return NextResponse.json({ error: "Некорректный id актера." }, { status: 400 });
  }

  try {
    const tmdbAvailable = await isTmdbReachable();
    if (!tmdbAvailable) {
      return NextResponse.json({ error: "TMDB недоступен: DNS резолвит API в localhost." }, { status: 503 });
    }

    const person = await getPersonFullDetails(personId);
    return NextResponse.json(person);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load TMDB person details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
