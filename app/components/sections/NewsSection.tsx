import Image from "next/image";
import { ArrowRightIcon, CalendarIcon } from "../icons";
import type { News } from "../../data/content";

type NewsSectionProps = {
  articles: News[];
};

export function NewsSection({ articles }: NewsSectionProps) {
  const [main, ...rest] = articles;

  return (
    <section className="mt-14 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-extrabold">Новости индустрии</h2>
        <button className="group flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white">
          Все новости
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {main ? (
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-lg shadow-indigo-500/10">
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src={main.image}
                alt={main.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 sm:left-5 sm:right-5 sm:bottom-5 space-y-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <CalendarIcon className="h-4 w-4 text-slate-200" />
                  {main.date}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">{main.title}</h3>
                <p className="max-w-xl text-sm text-slate-200">{main.excerpt}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {rest.map((article) => (
            <div
              key={article.title}
              className="flex items-start sm:items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className="relative h-20 w-20 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="120px"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">{article.date}</p>
                <p className="text-sm sm:text-base font-semibold text-white">{article.title}</p>
                <p className="text-sm text-slate-300 line-clamp-2">{article.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
