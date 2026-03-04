import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { getServerSession } from "@/app/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return null;
  if (rating < 1 || rating > 5) return null;
  return Math.round(rating);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const actorId = Number.parseInt(id, 10);
  if (!Number.isFinite(actorId) || actorId <= 0) {
    return NextResponse.json({ error: "Invalid actor id" }, { status: 400 });
  }

  const [session, aggregate] = await Promise.all([
    getServerSession(),
    db.actorRating.aggregate({
      where: { actorId },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  let userRating: number | null = null;
  if (session) {
    const existing = await db.actorRating.findUnique({
      where: { userId_actorId: { userId: session.userId, actorId } },
      select: { rating: true },
    });
    userRating = existing?.rating ?? null;
  }

  return NextResponse.json({
    average: aggregate._avg.rating ?? null,
    count: aggregate._count._all,
    userRating,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const actorId = Number.parseInt(id, 10);
  if (!Number.isFinite(actorId) || actorId <= 0) {
    return NextResponse.json({ error: "Invalid actor id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const rating = parseRating(body?.rating);
  if (!rating) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  await db.actorRating.upsert({
    where: { userId_actorId: { userId: session.userId, actorId } },
    update: { rating },
    create: { userId: session.userId, actorId, rating },
  });

  return NextResponse.json({ ok: true });
}
