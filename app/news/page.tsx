import Image from "next/image";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { ArrowRightIcon, CalendarIcon } from "../components/icons";
import { PageShell } from "../components/layout/PageShell";
import { newsArticles } from "../data/content";
import { getUiDictionary } from "../lib/i18n";
import { getIndustryNews } from "../lib/industry-news";
import { resolveSiteLanguage, SITE_LANGUAGE_COOKIE } from "../lib/language";

export default async function NewsPage() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const language = resolveSiteLanguage({
    cookieLanguage: cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const dictionary = getUiDictionary(language);
  const articles = await getIndustryNews(language).catch(() => newsArticles);

  return (
    <PageShell mainClassName="relative z-10 mx-auto flex-1 max-w-6xl px-5 pb-24 pt-10">
      <section className="space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180 text-slate-300" />
            На главную
          </Link>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{dictionary.navByHref["/news"] ?? "Новости"}</h1>
          <p className="text-sm text-slate-300">Главные новости киноиндустрии с переходом на оригинальные источники.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Link
              key={`${article.url ?? article.title}-${index}`}
              href={`/news/${article.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-white/25"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {article.source ?? "Industry"}
                </div>
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-slate-200">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {article.date}
                </div>
              </div>
              <div className="space-y-2 p-4">
                <h2 className="line-clamp-2 text-base font-bold text-white">{article.title}</h2>
                <p className="line-clamp-3 text-sm text-slate-300">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
