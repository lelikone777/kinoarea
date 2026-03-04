import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CalendarIcon } from "../icons";
import type { News } from "../../data/content";

type NewsSectionProps = {
  articles: News[];
};

export function NewsSection({ articles }: NewsSectionProps) {
  const [main, ...rest] = articles;
  const items = rest.slice(0, 5);

  return (
    <section className="mt-14 space-y-6" id="news">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Новости индустрии</h2>
        <Link
          href="/news"
          className="group rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
        >
          <span className="inline-flex items-center gap-2">
            Все новости
            <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-xl shadow-sky-500/10">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(180px,1fr)]">
          {main ? (
            <Link
              href={`/news/${main.slug}`}
              className="group relative h-[340px] overflow-hidden rounded-2xl sm:col-span-2 sm:h-[420px] lg:col-span-2 lg:row-span-2 lg:h-full"
            >
              <Image
                src={main.image}
                alt={main.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />

              <div className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                <CalendarIcon className="h-4 w-4 text-slate-200" />
                {main.date}
              </div>

              <div className="absolute right-6 top-6 z-20 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {main.source ?? "Industry"}
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-20 max-w-xl space-y-2">
                <h3 className="text-3xl font-extrabold transition group-hover:text-sky-200 sm:text-4xl">{main.title}</h3>
                <p className="text-sm text-slate-200 sm:text-base">{main.excerpt}</p>
              </div>
            </Link>
          ) : null}

          {items.map((article, index) => {
            const smHidden = index >= 4 ? "hidden lg:block" : "";
            return (
              <Link
                key={`${article.url ?? article.title}-${index}`}
                href={`/news/${article.slug}`}
                className={`group relative h-full min-h-[180px] overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition hover:-translate-y-1 hover:border-white/20 ${smHidden}`}
              >
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

                <div className="absolute left-3 top-3 z-20 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {article.source ?? "Industry"}
                </div>

                <div className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {article.date}
                </div>

                <div className="absolute inset-x-3 bottom-3 z-20 space-y-1">
                  <p className="line-clamp-2 text-sm font-semibold text-white">{article.title}</p>
                  <p className="line-clamp-2 text-xs text-slate-300">{article.excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
