import Image from "next/image";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type PopularMoviesProps = {
  movies: Movie[];
};

export function PopularMovies({ movies }: PopularMoviesProps) {
  const items = movies.slice(0, 6);

  return (
    <section className="mt-14 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Популярные фильмы</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>2025</span>
          <span className="h-1 w-1 rounded-full bg-slate-500" />
          <span className="text-white">2024</span>
          <span className="h-1 w-1 rounded-full bg-slate-500" />
          <span>2023</span>
          <span className="h-1 w-1 rounded-full bg-slate-500" />
          <span>2022</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((movie, index) => (
          <div
            key={movie.title}
            className={`group overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-1 hover:border-white/15 ${
              index >= 4 ? "hidden lg:block" : ""
            }`}
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={movie.image}
                alt={movie.title}
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              {movie.tag ? (
                <span className="absolute left-3 top-3 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {movie.tag}
                </span>
              ) : null}
              {movie.badge ? (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                  {movie.badge}
                </span>
              ) : null}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
                    <StarIcon className="h-4 w-4 text-amber-300" />
                    {movie.rating.toFixed(1)}
                  </div>
                  <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 transition hover:-translate-y-0.5">
                    Билеты
                  </button>
                </div>
                <p className="mt-3 text-lg font-bold leading-6">{movie.title}</p>
                <p className="text-sm text-slate-300">{movie.genre}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40">
        Смотреть все
        <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
      </button>
    </section>
  );
}
