"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, PlayIcon, ArrowRightIcon } from "../icons";
import type { Trailer } from "../../data/content";
import { useUiDictionary } from "@/app/hooks/useUiDictionary";

export type TrailerHero = {
  title: string;
  description: string;
  image: string;
  duration: string;
  tag: string;
  movieId?: number;
  trailerKey?: string;
  trailerUrl?: string;
  actors: {
    name: string;
    role: string;
    avatar: string;
  }[];
};

type TrailersSectionProps = {
  hero: TrailerHero;
  trailers: Trailer[];
};

function toTrailerSearchUrl(title: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} trailer`)}`;
}

function getWatchUrl(input: { title: string; trailerKey?: string; trailerUrl?: string }) {
  if (input.trailerUrl) {
    return input.trailerUrl;
  }
  if (input.trailerKey) {
    return `https://www.youtube.com/watch?v=${input.trailerKey}`;
  }
  return toTrailerSearchUrl(input.title);
}

function normalizeTrailerType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "official trailer") return "Trailer";
  if (normalized === "teaser") return "Teaser";
  if (normalized === "clip") return "Clip";
  return value;
}

export function TrailersSection({ hero, trailers }: TrailersSectionProps) {
  const { dictionary } = useUiDictionary();
  const items = trailers.slice(0, 5);

  const heroWatchUrl = getWatchUrl(hero);
  const heroMovieHref = hero.movieId ? `/movies/${hero.movieId}` : "/movies";

  return (
    <section className="mt-14 space-y-6" id="trailers-week">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">{dictionary.trailers.title}</h2>
        <Link
          href="/trailers"
          className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
        >
          {dictionary.trailers.all}
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-xl shadow-sky-500/10">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(180px,1fr)]">
          <div className="relative h-[340px] overflow-hidden rounded-2xl sm:col-span-2 sm:h-[420px] lg:col-span-2 lg:row-span-2 lg:h-full">
            <Image
              src={hero.image}
              alt={hero.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="h-full w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
            {hero.movieId ? (
              <Link href={heroMovieHref} className="absolute inset-0 z-20" aria-label={`Open ${hero.title}`} />
            ) : (
              <a href={heroWatchUrl} target="_blank" rel="noreferrer" className="absolute inset-0 z-20" aria-label={`Open trailer ${hero.title}`} />
            )}

            <div className="absolute left-6 top-6 z-30 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
              <PlayIcon className="h-4 w-4 text-emerald-300" />
              {hero.tag}
            </div>

            <div className="pointer-events-none absolute right-6 top-6 z-30 flex flex-wrap items-center justify-end gap-3 text-xs text-slate-300 sm:max-w-sm">
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">{dictionary.trailers.action}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">{dictionary.trailers.drama}</span>
              <span className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 font-semibold text-emerald-300 backdrop-blur">
                <PlayIcon className="h-4 w-4" />
                {hero.duration}
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-30 flex flex-col gap-4 sm:max-w-xl">
              <div>
                {hero.movieId ? (
                  <Link href={heroMovieHref} className="pointer-events-auto inline-block">
                    <h3 className="text-3xl font-extrabold transition hover:text-sky-300 sm:text-4xl">{hero.title}</h3>
                  </Link>
                ) : (
                  <a href={heroWatchUrl} target="_blank" rel="noreferrer" className="pointer-events-auto inline-block">
                    <h3 className="text-3xl font-extrabold transition hover:text-sky-300 sm:text-4xl">{hero.title}</h3>
                  </a>
                )}
                <p className="mt-2 max-w-2xl text-base text-slate-200">{hero.description}</p>
              </div>

              <div className="pointer-events-auto flex flex-wrap items-center gap-3">
                <a
                  href={heroWatchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/70 hover:bg-white/5 hover:shadow-lg hover:shadow-sky-500/20"
                >
                  <PlayIcon className="h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5" />
                  {dictionary.trailers.watch}
                </a>
                <Link
                  href={heroMovieHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/50"
                >
                  <CalendarIcon className="h-4 w-4 text-slate-300" />
                  {dictionary.trailers.toSchedule}
                </Link>
              </div>

              <div className="pointer-events-auto flex flex-wrap gap-3">
                {hero.actors.map((actor) => (
                  <div key={actor.name} className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2 backdrop-blur">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image src={actor.avatar} alt={actor.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{actor.name}</p>
                      <p className="text-xs text-slate-400">{actor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {items.map((trailer, index) => {
            const smHidden = index >= 4 ? "hidden lg:block" : "";
            const watchUrl = getWatchUrl(trailer);
            const detailsHref = trailer.movieId ? `/movies/${trailer.movieId}` : undefined;

            return (
              <div
                key={`${trailer.movieId ?? trailer.title}-${index}`}
                className={`group relative h-full min-h-[180px] overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition hover:-translate-y-1 hover:border-white/20 ${smHidden}`}
              >
                <div className="relative h-full">
                  <Image
                    src={trailer.image}
                    alt={trailer.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-3 top-3 z-40 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur transition hover:bg-black/80"
                  >
                    <PlayIcon className="h-4 w-4" />
                    {normalizeTrailerType(trailer.time)}
                  </a>

                  {trailer.note ? (
                    <div className="absolute left-3 top-3 z-20 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {trailer.note}
                    </div>
                  ) : null}

                  <div className="absolute inset-x-3 bottom-3 z-20 space-y-1">
                    <p className="text-sm font-semibold text-white">{trailer.title}</p>
                    <p className="text-xs text-slate-400">{dictionary.trailers.editorsPick}</p>
                  </div>

                  {detailsHref ? (
                    <Link href={detailsHref} className="absolute inset-0 z-30" aria-label={`Open ${trailer.title}`} />
                  ) : (
                    <a href={watchUrl} target="_blank" rel="noreferrer" className="absolute inset-0 z-30" aria-label={`Open trailer ${trailer.title}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
