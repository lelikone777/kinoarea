import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { navLinks } from "../../data/content";
import { getPersonFullDetails } from "../../lib/tmdb";

type ActorPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("ru-RU");
}

export async function generateMetadata({ params }: ActorPageProps): Promise<Metadata> {
  const { id } = await params;
  const personId = Number(id);

  if (!Number.isFinite(personId) || personId <= 0) {
    return { title: "Актер не найден" };
  }

  try {
    const person = await getPersonFullDetails(personId);
    return {
      title: `${person.name} | Актер | TMDB`,
      description: person.biography || `Профиль актера ${person.name}`,
    };
  } catch {
    return { title: "Карточка актера" };
  }
}

export default async function ActorDetailsPage({ params }: ActorPageProps) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isFinite(personId) || personId <= 0) notFound();

  let person;
  try {
    person = await getPersonFullDetails(personId);
  } catch {
    notFound();
  }

  const socialLinks = [
    person.imdbId
      ? { label: "IMDb", href: `https://www.imdb.com/name/${person.imdbId}` }
      : null,
    person.social.instagram
      ? { label: "Instagram", href: `https://www.instagram.com/${person.social.instagram}` }
      : null,
    person.social.twitter
      ? { label: "X", href: `https://x.com/${person.social.twitter}` }
      : null,
    person.social.facebook
      ? { label: "Facebook", href: `https://www.facebook.com/${person.social.facebook}` }
      : null,
    person.social.youtube
      ? { label: "YouTube", href: `https://www.youtube.com/${person.social.youtube}` }
      : null,
    person.social.tiktok
      ? { label: "TikTok", href: `https://www.tiktok.com/@${person.social.tiktok}` }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const filmography = person.castCredits.slice(0, 16);
  const behindTheScenes = person.crewCredits.slice(0, 12);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto max-w-6xl space-y-8 px-5 pb-24 pt-10">
        <Link href="/actors" className="inline-flex text-sm text-sky-300 hover:text-sky-200">
          Назад в каталог актеров
        </Link>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-[300px_1fr]">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
            <Image src={person.profile} alt={person.name} fill className="object-cover" />
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-extrabold">{person.name}</h1>
              <p className="text-slate-300">
                {person.department || "Актер"} | популярность {person.popularity?.toFixed(1) ?? "N/A"}
              </p>
            </div>

            {person.knownAs.length ? (
              <div className="flex flex-wrap gap-2 text-xs">
                {person.knownAs.slice(0, 8).map((alias) => (
                  <span key={alias} className="rounded-full border border-white/15 px-3 py-1 text-slate-200">
                    {alias}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="text-slate-200">{person.biography}</p>

            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <p><span className="text-white">Дата рождения:</span> {formatDate(person.birthday)}</p>
              <p><span className="text-white">Место рождения:</span> {person.placeOfBirth || "N/A"}</p>
              <p><span className="text-white">Дата смерти:</span> {formatDate(person.deathday)}</p>
              <p><span className="text-white">IMDb:</span> {person.imdbId || "N/A"}</p>
            </div>

            {socialLinks.length ? (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-xl border border-white/20 px-3 py-2 text-sm hover:border-white/40"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-xl font-bold">Известен по</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {person.knownFor.length ? (
              person.knownFor.map((movie) => (
                <Link
                  key={`known-${movie.id}-${movie.title}`}
                  href={`/movies/${movie.id}`}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-sky-300/40"
                >
                  <div className="relative aspect-[2/3]">
                    <Image src={movie.poster} alt={movie.title} fill sizes="220px" className="object-cover" />
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="line-clamp-1 text-sm font-semibold">{movie.title}</p>
                    <p className="text-xs text-slate-400">
                      {movie.year ?? "Год неизвестен"} | рейтинг {movie.rating.toFixed(1)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-400">Данные о работах пока недоступны.</p>
            )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Фильмография (актер)</h2>
            <div className="space-y-2">
              {filmography.length ? (
                filmography.map((movie) => (
                  <Link
                    key={`cast-${movie.id}-${movie.title}`}
                    href={`/movies/${movie.id}`}
                    className="block rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-sky-300/40"
                  >
                    <p className="text-sm font-semibold">{movie.title}</p>
                    <p className="text-xs text-slate-400">
                      {movie.year ?? "Год неизвестен"}
                      {movie.character ? ` | роль: ${movie.character}` : ""}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400">Нет данных о ролях.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">За кадром</h2>
            <div className="space-y-2">
              {behindTheScenes.length ? (
                behindTheScenes.map((movie) => (
                  <Link
                    key={`crew-${movie.id}-${movie.title}-${movie.job ?? "job"}`}
                    href={`/movies/${movie.id}`}
                    className="block rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-sky-300/40"
                  >
                    <p className="text-sm font-semibold">{movie.title}</p>
                    <p className="text-xs text-slate-400">
                      {movie.year ?? "Год неизвестен"}
                      {movie.job ? ` | ${movie.job}` : ""}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400">Нет данных по съемочной группе.</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
