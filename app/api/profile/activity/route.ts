import { NextResponse } from "next/server";
import { getServerSession } from "@/app/lib/auth/session";
import { db } from "@/app/lib/db";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [movieRatings, actorRatings, movieComments, actorComments, movieReactions, actorReactions] =
    await Promise.all([
      db.movieRating.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, movieId: true, rating: true, createdAt: true },
      }),
      db.actorRating.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, actorId: true, rating: true, createdAt: true },
      }),
      db.movieComment.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, movieId: true, body: true, createdAt: true },
      }),
      db.actorComment.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, actorId: true, body: true, createdAt: true },
      }),
      db.movieCommentReaction.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          value: true,
          createdAt: true,
          comment: { select: { movieId: true, body: true } },
        },
      }),
      db.actorCommentReaction.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          value: true,
          createdAt: true,
          comment: { select: { actorId: true, body: true } },
        },
      }),
    ]);

  return NextResponse.json({
    ratings: {
      movies: movieRatings,
      actors: actorRatings,
    },
    comments: {
      movies: movieComments,
      actors: actorComments,
    },
    reactions: {
      movieComments: movieReactions.map((reaction) => ({
        id: reaction.id,
        value: reaction.value,
        createdAt: reaction.createdAt,
        movieId: reaction.comment.movieId,
        body: reaction.comment.body,
      })),
      actorComments: actorReactions.map((reaction) => ({
        id: reaction.id,
        value: reaction.value,
        createdAt: reaction.createdAt,
        actorId: reaction.comment.actorId,
        body: reaction.comment.body,
      })),
    },
  });
}
