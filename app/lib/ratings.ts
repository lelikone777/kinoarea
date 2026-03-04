import { db } from "./db";

type RatingSummary = {
  average: number | null;
  count: number;
};

export async function getMovieRatingSummary(movieId: number): Promise<RatingSummary> {
  const result = await db.movieRating.aggregate({
    where: { movieId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return {
    average: result._avg.rating ?? null,
    count: result._count._all,
  };
}

export async function getActorRatingSummary(actorId: number): Promise<RatingSummary> {
  const result = await db.actorRating.aggregate({
    where: { actorId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return {
    average: result._avg.rating ?? null,
    count: result._count._all,
  };
}

export async function getMovieRatingMap(movieIds: number[]) {
  if (!movieIds.length) return {};

  const grouped = await db.movieRating.groupBy({
    by: ["movieId"],
    where: { movieId: { in: movieIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return Object.fromEntries(
    grouped.map((entry) => [
      entry.movieId,
      { average: entry._avg.rating ?? null, count: entry._count._all },
    ]),
  );
}

export async function getActorRatingMap(actorIds: number[]) {
  if (!actorIds.length) return {};

  const grouped = await db.actorRating.groupBy({
    by: ["actorId"],
    where: { actorId: { in: actorIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return Object.fromEntries(
    grouped.map((entry) => [
      entry.actorId,
      { average: entry._avg.rating ?? null, count: entry._count._all },
    ]),
  );
}
