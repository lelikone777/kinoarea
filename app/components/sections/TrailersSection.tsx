import Image from "next/image";
import { CalendarIcon, PlayIcon, ArrowRightIcon } from "../icons";
import type { Trailer } from "../../data/content";

export type TrailerHero = {
  title: string;
  description: string;
  image: string;
  duration: string;
  tag: string;
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

export function TrailersSection({ hero, trailers }: TrailersSectionProps) {
  const items = trailers.slice(0, 5);

  return (
    <section className="mt-14 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-extrabold leading-tight">Трейлеры недели</h2>
        <button className="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
          Все трейлеры
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-white/5 shadow-xl shadow-sky-500/10">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(180px,1fr)]">
          <div className="relative h-[300px] min-[420px]:h-[340px] overflow-hidden rounded-2xl sm:col-span-2 sm:h-[420px] lg:col-span-2 lg:row-span-2 lg:h-full">
            <Image
              src={hero.image}
              alt={hero.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="h-full w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
              <PlayIcon className="h-4 w-4 text-emerald-300" />
              {hero.tag}
            </div>
            <div className="absolute left-4 right-4 bottom-4 sm:left-6 sm:right-6 sm:bottom-6 flex flex-col gap-3 sm:gap-4 sm:max-w-xl">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                  Экшн
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                  Драма
                </span>
                <span className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 font-semibold text-emerald-300 backdrop-blur">
                  <PlayIcon className="h-4 w-4" />
                  {hero.duration}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold leading-tight sm:text-4xl">{hero.title}</h3>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-200">{hero.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/30">
                  <PlayIcon className="h-4 w-4 text-slate-900" />
                  Смотреть
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/50">
                  <CalendarIcon className="h-4 w-4 text-slate-300" />
                  В расписание
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {hero.actors.map((actor) => (
                  <div
                    key={actor.name}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2 backdrop-blur"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={actor.avatar}
                        alt={actor.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
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
            return (
            <div
              key={trailer.title}
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
                <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur">
                  <PlayIcon className="h-4 w-4" />
                  {trailer.time}
                </div>
                {trailer.note ? (
                  <div className="absolute left-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {trailer.note}
                  </div>
                ) : null}
                <div className="absolute inset-x-3 bottom-3 space-y-1">
                  <p className="text-sm font-semibold text-white">{trailer.title}</p>
                  <p className="text-xs text-slate-400">
                    Выбор редакции и лучшие моменты фильма
                  </p>
                </div>
              </div>
            </div>
          );})}
        </div>
      </div>
    </section>
  );
}
