import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type UpcomingSectionProps = {
  movies: Movie[];
};

export function UpcomingSection({ movies }: UpcomingSectionProps) {
  return (
    <section className="mt-14 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Скоро на экранах</h2>
        <span className="text-xs text-slate-400">Топ ожиданий: фильмы и сериалы</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {movies.map((movie, index) => {
          const isClickable = Boolean(movie.id);
          return (
            <div
              key={`${movie.id ?? movie.title}-${movie.year ?? "na"}-${index}`}
              className={`group overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-lg shadow-sky-500/10 transition hover:-translate-y-1 hover:border-white/15 ${
                isClickable ? "cursor-pointer" : ""
              }`}
            >
              <div className="relative aspect-[2/3]">
                <Image
                  src={movie.image}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 23vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                {movie.tag ? (
                  <span className="absolute left-3 top-3 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    {movie.tag}
                  </span>
                ) : null}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
                      <StarIcon className="h-4 w-4 text-amber-300" />
                      {movie.rating.toFixed(1)}
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Подробнее</span>
                  </div>
                  <p className="mt-3 text-lg font-bold leading-6">{movie.title}</p>
                  <p className="text-sm text-slate-300">{movie.genre}</p>
                </div>
                {movie.id ? (
                  <Link href={`/movies/${movie.id}`} className="absolute inset-0" aria-label={`Открыть фильм ${movie.title}`} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
