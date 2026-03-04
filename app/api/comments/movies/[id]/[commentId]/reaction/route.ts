import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { getServerSession } from "@/app/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string; commentId: string }>;
};

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function normalizeValue(value: unknown) {
  if (value === "like") return "LIKE";
  if (value === "dislike") return "DISLIKE";
  if (value === "none") return null;
  return undefined;
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await params;
  const movieId = parseId(id);
  if (!movieId || !commentId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const value = normalizeValue(body?.value);
  if (value === undefined) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  const comment = await db.movieComment.findUnique({
    where: { id: commentId },
    select: { movieId: true },
  });

  if (!comment || comment.movieId !== movieId) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (!value) {
    await db.movieCommentReaction.deleteMany({
      where: { commentId, userId: session.userId },
    });
    return NextResponse.json({ ok: true });
  }

  await db.movieCommentReaction.upsert({
    where: { userId_commentId: { userId: session.userId, commentId } },
    update: { value },
    create: { userId: session.userId, commentId, value },
  });

  return NextResponse.json({ ok: true });
}
