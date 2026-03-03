import Image from "next/image";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowRightIcon, CalendarIcon } from "../../components/icons";
import { PageShell } from "../../components/layout/PageShell";
import { newsArticles } from "../../data/content";
import { getUiDictionary } from "../../lib/i18n";
import { getIndustryNews } from "../../lib/industry-news";
import { resolveSiteLanguage, SITE_LANGUAGE_COOKIE } from "../../lib/language";

type NewsDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsDetailsPage({ params }: NewsDetailsPageProps) {
  const { slug } = await params;
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const language = resolveSiteLanguage({
    cookieLanguage: cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const dictionary = getUiDictionary(language);
  const articles = await getIndustryNews(language).catch(() => newsArticles);
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <PageShell mainClassName="relative z-10 mx-auto flex-1 max-w-5xl px-5 pb-24 pt-10">
      <section className="space-y-6">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-sky-200">
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
          {dictionary.navByHref["/news"] ?? "Новости"}
        </Link>

        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="relative h-72 w-full sm:h-96">
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-slate-200">
              <CalendarIcon className="h-4 w-4" />
              {article.date}
            </div>
            <div className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {article.source ?? "Industry"}
            </div>
            <h1 className="absolute bottom-6 left-6 right-6 text-2xl font-extrabold sm:text-4xl">{article.title}</h1>
          </div>

          <div className="space-y-6 p-6">
            <p className="text-base leading-7 text-slate-200">{article.excerpt}</p>
            <p className="text-sm leading-7 text-slate-300">
              Это краткая карточка новости. Полный материал доступен на сайте первоисточника.
            </p>
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
              >
                Открыть источник
                <ArrowRightIcon className="h-4 w-4 text-slate-300" />
              </a>
            ) : null}
          </div>
        </article>
      </section>
    </PageShell>
  );
}

