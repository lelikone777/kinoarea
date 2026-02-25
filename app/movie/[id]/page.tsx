import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieFullDetails } from "../../lib/tmdb";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

function formatMoney(value?: number) {
  if (!value) return "N/A";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("ru-RU");
}

function formatRuntime(minutes?: number) {
  if (!minutes || minutes <= 0) return "N/A";
  return `${Math.floor(minutes / 60)} ч ${minutes % 60} м`;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isFinite(movieId)) {
    return { title: "Фильм не найден" };
  }

  try {
    const movie = await getMovieFullDetails(movieId);
    return {
      title: `${movie.title} (${movie.year ?? "N/A"}) - Kinoarea`,
      description: movie.overview || `Детальная информация о фильме ${movie.title}`,
    };
  } catch {
    return { title: "Фильм - Kinoarea" };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isFinite(movieId)) notFound();

  let movie;
  try {
    movie = await getMovieFullDetails(movieId);
  } catch {
    notFound();
  }

  const leadTrailer = movie.trailers[0];
  const providers = movie.providersByRegion.filter((entry) => entry.flatrate.length || entry.rent.length || entry.buy.length);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0">
        <Image src={movie.backdrop} alt={movie.title} fill priority sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/80 to-slate-950" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-sm text-slate-200 hover:border-white/40">
            ← На главную
          </Link>
        </div>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur md:grid-cols-[280px_1fr]">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10">
            <Image src={movie.poster} alt={movie.title} fill sizes="280px" className="object-cover" priority />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold sm:text-4xl">
                {movie.title} {movie.year ? <span className="text-slate-400">({movie.year})</span> : null}
              </h1>
              {movie.originalTitle && movie.originalTitle !== movie.title ? <p className="text-sm text-slate-300">Оригинальное название: {movie.originalTitle}</p> : null}
              {movie.tagline ? <p className="text-sm italic text-sky-200">{movie.tagline}</p> : null}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="rounded-full border border-white/15 px-3 py-1 text-slate-200">
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-sm leading-6 text-slate-200">{movie.overview || "Описание отсутствует."}</p>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Рейтинг TMDB</p>
                <p className="text-base font-semibold">{movie.voteAverage.toFixed(1)} ({movie.voteCount ?? 0})</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Длительность</p>
                <p className="text-base font-semibold">{formatRuntime(movie.runtime)}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Дата релиза</p>
                <p className="text-base font-semibold">{formatDate(movie.releaseDate)}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Бюджет</p>
                <p className="text-base font-semibold">{formatMoney(movie.budget)}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Сборы</p>
                <p className="text-base font-semibold">{formatMoney(movie.revenue)}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">Статус</p>
                <p className="text-base font-semibold">{movie.status || "N/A"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              {movie.imdbId ? (
                <a
                  href={`https://www.imdb.com/title/${movie.imdbId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 px-3 py-1 hover:border-white/40"
                >
                  IMDb
                </a>
              ) : null}
              {movie.homepage ? (
                <a href={movie.homepage} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 hover:border-white/40">
                  Официальный сайт
                </a>
              ) : null}
              <span className="rounded-full border border-white/15 px-3 py-1">ID: {movie.id}</span>
              {movie.originalLanguage ? <span className="rounded-full border border-white/15 px-3 py-1">Язык: {movie.originalLanguage}</span> : null}
            </div>
          </div>
        </section>

        {leadTrailer ? (
          <section className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="text-xl font-bold">Трейлер</h2>
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${leadTrailer.key}`}
                title={leadTrailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Актеры</h2>
            <div className="space-y-2">
              {movie.cast.length ? (
                movie.cast.slice(0, 12).map((actor) => (
                  <div key={`${actor.id}-${actor.name}`} className="flex items-center gap-3 rounded-xl bg-white/5 p-2">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image src={actor.profile || movie.poster} alt={actor.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{actor.name}</p>
                      <p className="text-xs text-slate-400">{actor.character || "Роль не указана"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Нет данных.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Съемочная группа</h2>
            <div className="space-y-2">
              {movie.crew.length ? (
                movie.crew.slice(0, 12).map((member) => (
                  <div key={`${member.id}-${member.name}-${member.job}`} className="rounded-xl bg-white/5 p-2">
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-slate-400">
                      {member.job || "Должность не указана"}
                      {member.department ? ` • ${member.department}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Нет данных.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-xl font-bold">Производство и языки</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-300">Компании</p>
              <ul className="space-y-1 text-sm text-slate-200">
                {movie.productionCompanies.length ? movie.productionCompanies.slice(0, 10).map((company) => <li key={company.id}>• {company.name}</li>) : <li>Нет данных</li>}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-300">Страны</p>
              <ul className="space-y-1 text-sm text-slate-200">
                {movie.productionCountries.length ? movie.productionCountries.map((country) => <li key={country.code}>• {country.name} ({country.code})</li>) : <li>Нет данных</li>}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-300">Языки</p>
              <ul className="space-y-1 text-sm text-slate-200">
                {movie.spokenLanguages.length ? movie.spokenLanguages.map((lang) => <li key={lang.code}>• {lang.name || lang.englishName}</li>) : <li>Нет данных</li>}
              </ul>
            </div>
          </div>
        </section>

        {providers.length ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Где смотреть</h2>
            <div className="space-y-3">
              {providers.slice(0, 8).map((provider) => (
                <div key={provider.region} className="rounded-xl bg-white/5 p-3 text-sm">
                  <p className="font-semibold">Регион: {provider.region}</p>
                  <p className="text-slate-300">Подписка: {provider.flatrate.join(", ") || "—"}</p>
                  <p className="text-slate-300">Аренда: {provider.rent.join(", ") || "—"}</p>
                  <p className="text-slate-300">Покупка: {provider.buy.join(", ") || "—"}</p>
                  {provider.link ? (
                    <a href={provider.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sky-300 hover:text-sky-200">
                      Открыть провайдеров
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {movie.keywords.length ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Ключевые слова</h2>
            <div className="flex flex-wrap gap-2">
              {movie.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200">
                  {keyword}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Похожие фильмы</h2>
            <div className="grid grid-cols-2 gap-3">
              {movie.similar.slice(0, 6).map((item) => (
                <Link key={item.id ?? item.title} href={item.id ? `/movie/${item.id}` : "#"} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <div className="relative aspect-[2/3]">
                    <Image src={item.image} alt={item.title} fill sizes="180px" className="object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.rating.toFixed(1)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Рекомендации</h2>
            <div className="grid grid-cols-2 gap-3">
              {movie.recommendations.slice(0, 6).map((item) => (
                <Link key={item.id ?? item.title} href={item.id ? `/movie/${item.id}` : "#"} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <div className="relative aspect-[2/3]">
                    <Image src={item.image} alt={item.title} fill sizes="180px" className="object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.rating.toFixed(1)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {movie.reviews.length ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Отзывы</h2>
            <div className="space-y-3">
              {movie.reviews.slice(0, 5).map((review) => (
                <article key={review.id} className="rounded-xl bg-white/5 p-3">
                  <p className="text-sm font-semibold">
                    {review.author}
                    {typeof review.rating === "number" ? ` • ${review.rating}/10` : ""}
                  </p>
                  <p className="mt-2 line-clamp-6 text-sm text-slate-200">{review.content}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2">
          {movie.posters.length ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-xl font-bold">Постеры</h2>
              <div className="grid grid-cols-3 gap-2">
                {movie.posters.slice(0, 9).map((src, idx) => (
                  <div key={`${src}-${idx}`} className="relative aspect-[2/3] overflow-hidden rounded-lg">
                    <Image src={src} alt={`poster-${idx + 1}`} fill sizes="200px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {movie.backdrops.length ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-xl font-bold">Кадры</h2>
              <div className="grid grid-cols-2 gap-2">
                {movie.backdrops.slice(0, 8).map((src, idx) => (
                  <div key={`${src}-${idx}`} className="relative aspect-video overflow-hidden rounded-lg">
                    <Image src={src} alt={`backdrop-${idx + 1}`} fill sizes="300px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-xl font-bold">Полные данные TMDB (RAW)</h2>
          <p className="mb-3 text-sm text-slate-400">Здесь выводится полный объект ответа TMDB для этого фильма.</p>
          <pre className="max-h-[480px] overflow-auto rounded-xl border border-white/10 bg-slate-950/80 p-3 text-xs text-slate-200">
            {JSON.stringify(movie.raw, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  );
}
