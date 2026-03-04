import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

function parseIds(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((raw) => Number.parseInt(raw.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = parseIds(searchParams.get("ids"));

  if (!ids.length) {
    return NextResponse.json({ ratings: {} });
  }

  const grouped = await db.movieRating.groupBy({
    by: ["movieId"],
    where: { movieId: { in: ids } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const ratings = Object.fromEntries(
    grouped.map((entry) => [
      entry.movieId,
      { average: entry._avg.rating ?? null, count: entry._count._all },
    ]),
  );

  return NextResponse.json({ ratings });
}
