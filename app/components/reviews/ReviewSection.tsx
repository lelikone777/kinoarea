"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSiteLanguage } from "@/app/hooks/useSiteLanguage";
import { useUiDictionary } from "@/app/hooks/useUiDictionary";

type ReviewSectionProps = {
  targetType: "movie" | "actor";
  targetId: number;
};

type SessionResponse = {
  authenticated: boolean;
  user?: { id: string; nickname: string; avatarUrl?: string | null };
};

type RatingResponse = {
  average: number | null;
  count: number;
  userRating: number | null;
};

type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
  userReaction: "LIKE" | "DISLIKE" | null;
  user: { id: string; nickname: string; avatarUrl?: string | null };
};

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function ReviewSection({ targetType, targetId }: ReviewSectionProps) {
  const { language } = useSiteLanguage();
  const { dictionary } = useUiDictionary();
  const text = dictionary.reviews;
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [rating, setRating] = useState<RatingResponse | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePath = targetType === "movie" ? "movies" : "actors";
  const ratingUrl = `/api/ratings/${basePath}/${targetId}`;
  const commentsUrl = `/api/comments/${basePath}/${targetId}`;

  const isAuthenticated = Boolean(session?.authenticated);

  const averageLabel = useMemo(() => {
    if (!rating?.average) return text.ratingMissing;
    return rating.average.toFixed(1);
  }, [rating?.average, text.ratingMissing]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionRes, ratingRes, commentsRes] = await Promise.all([
        fetch("/api/auth/session"),
        fetch(ratingUrl),
        fetch(commentsUrl),
      ]);

      const sessionPayload = (await sessionRes.json()) as SessionResponse;
      const ratingPayload = (await ratingRes.json()) as RatingResponse;
      const commentsPayload = (await commentsRes.json()) as { comments: CommentItem[] };

      setSession(sessionPayload);
      setRating(ratingPayload);
      setComments(Array.isArray(commentsPayload.comments) ? commentsPayload.comments : []);
    } catch {
      setError(text.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, targetType]);

  const submitRating = async (value: number) => {
    if (!isAuthenticated) return;
    setIsSubmitting(true);
    try {
      await fetch(ratingUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      const ratingRes = await fetch(ratingUrl);
      const ratingPayload = (await ratingRes.json()) as RatingResponse;
      setRating(ratingPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitComment = async () => {
    if (!isAuthenticated) return;
    const body = commentBody.trim();
    if (!body) return;
    setIsSubmitting(true);
    try {
      await fetch(commentsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      setCommentBody("");
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!isAuthenticated) return;
    setIsSubmitting(true);
    try {
      await fetch(`${commentsUrl}/${commentId}`, { method: "DELETE" });
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const reactToComment = async (commentId: string, value: "like" | "dislike" | "none") => {
    if (!isAuthenticated) return;
    await fetch(`${commentsUrl}/${commentId}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    await loadData();
  };

  const ratingStars = STAR_VALUES.map((value) => {
    const active = (hoveredStar ?? rating?.userRating ?? 0) >= value;
    return (
      <button
        key={value}
        type="button"
        onMouseEnter={() => setHoveredStar(value)}
        onMouseLeave={() => setHoveredStar(null)}
        onClick={() => submitRating(value)}
        disabled={!isAuthenticated || isSubmitting}
        className={`rounded-lg p-1 transition ${active ? "text-amber-300" : "text-slate-600"} ${isAuthenticated ? "hover:text-amber-200" : "cursor-not-allowed"}`}
        aria-label={`${text.rateThis} ${value}`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.381 2.458a1 1 0 00-.364 1.118l1.286 3.973c.3.922-.755 1.688-1.538 1.118l-3.381-2.458a1 1 0 00-1.175 0l-3.381 2.458c-.783.57-1.838-.196-1.538-1.118l1.286-3.973a1 1 0 00-.364-1.118L2.047 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
        </svg>
      </button>
    );
  });

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{text.title}</h2>
          <p className="text-sm text-slate-300">
            {text.averageLabel}: <span className="text-white">{averageLabel}</span>{" "}
            {rating?.count ? `(${rating.count} ${text.votesLabel})` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs uppercase tracking-wide text-slate-400">{text.yourRating}</p>
          <div className="flex items-center gap-1">{ratingStars}</div>
          {!isAuthenticated ? (
            <Link href="/auth/login" className="text-xs text-sky-300 hover:text-sky-200">
              {text.loginToRate}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{text.commentTitle}</h3>

        {isAuthenticated ? (
          <div className="space-y-2">
            <textarea
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder={text.commentPlaceholder}
              className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-sky-400"
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={isSubmitting || !commentBody.trim()}
              className="rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
            >
              {text.submitComment}
            </button>
          </div>
        ) : null}

        {isLoading ? <p className="text-sm text-slate-400">{text.loading}</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        {!isLoading && !error && comments.length === 0 ? (
          <p className="text-sm text-slate-400">{text.noComments}</p>
        ) : null}

        <div className="space-y-3">
          {comments.map((comment) => {
            const isOwner = session?.user?.id === comment.user.id;
            const dateLabel = new Date(comment.createdAt).toLocaleDateString(language);
            const userReaction = comment.userReaction;

            return (
              <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
                      {comment.user.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.nickname}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                          {comment.user.nickname.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{comment.user.nickname}</p>
                      <p className="text-xs text-slate-400">{dateLabel}</p>
                    </div>
                  </div>

                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => deleteComment(comment.id)}
                      disabled={isSubmitting}
                      className="text-xs text-rose-300 hover:text-rose-200"
                    >
                      {text.delete}
                    </button>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-slate-200">{comment.body}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => reactToComment(comment.id, userReaction === "LIKE" ? "none" : "like")}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1 rounded-full border px-2 py-1 transition ${userReaction === "LIKE" ? "border-emerald-400/70 text-emerald-200" : "border-white/10 text-slate-300 hover:border-white/30"} ${!isAuthenticated ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {text.like} {comment.likeCount}
                  </button>
                  <button
                    type="button"
                    onClick={() => reactToComment(comment.id, userReaction === "DISLIKE" ? "none" : "dislike")}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1 rounded-full border px-2 py-1 transition ${userReaction === "DISLIKE" ? "border-rose-400/70 text-rose-200" : "border-white/10 text-slate-300 hover:border-white/30"} ${!isAuthenticated ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {text.dislike} {comment.dislikeCount}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
