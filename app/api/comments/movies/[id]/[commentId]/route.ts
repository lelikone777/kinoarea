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

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await params;
  const movieId = parseId(id);
  if (!movieId || !commentId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await db.movieComment.findUnique({
    where: { id: commentId },
    select: { userId: true, movieId: true },
  });

  if (!existing || existing.movieId !== movieId) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (existing.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.movieComment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
