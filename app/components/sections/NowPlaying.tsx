import Image from "next/image";
import { ArrowRightIcon, StarIcon } from "../icons";
import type { Movie } from "../../data/content";

type NowPlayingProps = {
  movies: Movie[];
  filters: string[];
};

export function NowPlaying({ movies, filters }: NowPlayingProps) {
  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Горячие сеансы сегодня
          </p>
          <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">Сейчас в прокате</h1>
          <p className="mt-1 text-sm text-slate-400">
            Смотрите свежие премьеры в любимых форматах и выбирайте удобные сеансы по
            городу.
          </p>
        </div>
        <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40">
          Полный список
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </button>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((filter) => (
          <button
            key={filter}
            className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie, index) => {
          const isNinth = index === 8;
          return (
          <div
            key={movie.title}
            className={`group relative overflow-hidden rounded-2xl bg-white/5 shadow-lg shadow-sky-500/10 ${
              isNinth ? "hidden sm:block lg:hidden" : ""
            }`}
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={movie.image}
                alt={movie.title}
                fill
                sizes="(max-width: 1024px) 50vw, 23vw"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute left-3 top-3 flex items-center gap-2">
                {movie.badge ? (
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950 shadow">
                    {movie.badge}
                  </span>
                ) : null}
                {movie.tag ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    {movie.tag}
                  </span>
                ) : null}
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
                    <span className="inline-flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-amber-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                  </span>
                  <button className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20">
                    Подробнее
                  </button>
                </div>
                <p className="mt-3 text-lg font-bold leading-6 text-white">
                  {movie.title}
                </p>
                <p className="text-sm text-slate-300">{movie.genre}</p>
              </div>
            </div>
          </div>
        );})}
      </div>
    </section>
  );
}
