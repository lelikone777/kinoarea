import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { getServerSession } from "@/app/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function normalizeBody(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return trimmed.slice(0, 2000);
  return trimmed;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const actorId = parseId(id);
  if (!actorId) {
    return NextResponse.json({ error: "Invalid actor id" }, { status: 400 });
  }

  const session = await getServerSession();
  const comments = await db.actorComment.findMany({
    where: { actorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, nickname: true, avatarUrl: true },
      },
    },
  });

  const commentIds = comments.map((comment) => comment.id);
  if (!commentIds.length) {
    return NextResponse.json({ comments: [] });
  }

  const [counts, userReactions] = await Promise.all([
    db.actorCommentReaction.groupBy({
      by: ["commentId", "value"],
      where: { commentId: { in: commentIds } },
      _count: { _all: true },
    }),
    session
      ? db.actorCommentReaction.findMany({
          where: { commentId: { in: commentIds }, userId: session.userId },
          select: { commentId: true, value: true },
        })
      : Promise.resolve([]),
  ]);

  const countsMap = new Map<string, { like: number; dislike: number }>();
  for (const entry of counts) {
    const current = countsMap.get(entry.commentId) ?? { like: 0, dislike: 0 };
    if (entry.value === "LIKE") current.like = entry._count._all;
    if (entry.value === "DISLIKE") current.dislike = entry._count._all;
    countsMap.set(entry.commentId, current);
  }

  const reactionsMap = new Map(userReactions.map((reaction) => [reaction.commentId, reaction.value]));

  const response = comments.map((comment) => ({
    ...comment,
    likeCount: countsMap.get(comment.id)?.like ?? 0,
    dislikeCount: countsMap.get(comment.id)?.dislike ?? 0,
    userReaction: reactionsMap.get(comment.id) ?? null,
  }));

  return NextResponse.json({ comments: response });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const actorId = parseId(id);
  if (!actorId) {
    return NextResponse.json({ error: "Invalid actor id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const normalized = normalizeBody(body?.body);
  if (!normalized) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  await db.actorComment.create({
    data: {
      actorId,
      userId: session.userId,
      body: normalized,
    },
  });

  return NextResponse.json({ ok: true });
}
