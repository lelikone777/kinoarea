import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { ReviewSection } from "../../components/reviews/ReviewSection";
import { navLinks } from "../../data/content";
import { getPersonFullDetails } from "../../lib/tmdb";
import { getUiDictionary } from "../../lib/i18n";
import { resolveSiteLanguage, SITE_LANGUAGE_COOKIE } from "../../lib/language";
import { getActorRatingSummary, getMovieRatingMap } from "../../lib/ratings";

type ActorPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date?: string, language = "ru-RU") {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString(language);
}

export async function generateMetadata({ params }: ActorPageProps): Promise<Metadata> {
  const { id } = await params;
  const personId = Number(id);
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const language = resolveSiteLanguage({
    cookieLanguage: cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  if (!Number.isFinite(personId) || personId <= 0) {
    return { title: "Actor not found" };
  }

  try {
    const person = await getPersonFullDetails(personId, language);
    return {
      title: `${person.name} | TMDB`,
      description: person.biography || `${person.name} profile`,
    };
  } catch {
    return { title: "Actor profile" };
  }
}

export default async function ActorDetailsPage({ params }: ActorPageProps) {
  const { id } = await params;
  const personId = Number(id);
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const language = resolveSiteLanguage({
    cookieLanguage: cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const dictionary = getUiDictionary(language);
  if (!Number.isFinite(personId) || personId <= 0) notFound();

  let person;
  try {
    person = await getPersonFullDetails(personId, language);
  } catch {
    notFound();
  }

  const socialLinks = [
    person.imdbId ? { label: "IMDb", href: `https://www.imdb.com/name/${person.imdbId}` } : null,
    person.social.instagram ? { label: "Instagram", href: `https://www.instagram.com/${person.social.instagram}` } : null,
    person.social.twitter ? { label: "X", href: `https://x.com/${person.social.twitter}` } : null,
    person.social.facebook ? { label: "Facebook", href: `https://www.facebook.com/${person.social.facebook}` } : null,
    person.social.youtube ? { label: "YouTube", href: `https://www.youtube.com/${person.social.youtube}` } : null,
    person.social.tiktok ? { label: "TikTok", href: `https://www.tiktok.com/@${person.social.tiktok}` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const filmography = person.castCredits.slice(0, 16);
  const behindTheScenes = person.crewCredits.slice(0, 12);
  const ratingSummary = await getActorRatingSummary(personId);
  const knownForMovieIds = person.knownFor.map((movie) => movie.id).filter((id) => typeof id === "number");
  const knownForRatings = await getMovieRatingMap(knownForMovieIds);
  const formatMovieRating = (id?: number | null) => {
    if (!id) return dictionary.reviews.ratingMissing;
    const entry = knownForRatings[id];
    return entry?.average ? entry.average.toFixed(1) : dictionary.reviews.ratingMissing;
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto w-full flex-1 max-w-6xl space-y-8 px-5 pb-24 pt-10">
        <Link href="/actors" className="inline-flex text-sm text-sky-300 hover:text-sky-200">
          {dictionary.actorDetails.back}
        </Link>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-[300px_1fr]">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
            <Image
              src={person.profile}
              alt={person.name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              loading="eager"
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-extrabold">{person.name}</h1>
              <p className="text-slate-300">
                {person.department || dictionary.actorDetails.actorFallback} | {dictionary.reviews.ratingLabel}{" "}
                {ratingSummary.average ? ratingSummary.average.toFixed(1) : dictionary.reviews.ratingMissing}
                {ratingSummary.count ? ` (${ratingSummary.count})` : ""} | {dictionary.actorDetails.popularity}{" "}
                {person.popularity?.toFixed(1) ?? dictionary.common.unknown}
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
              <p><span className="text-white">{dictionary.actorDetails.birthDate}:</span> {formatDate(person.birthday, language)}</p>
              <p><span className="text-white">{dictionary.actorDetails.birthPlace}:</span> {person.placeOfBirth || dictionary.common.unknown}</p>
              <p><span className="text-white">{dictionary.actorDetails.deathDate}:</span> {formatDate(person.deathday, language)}</p>
              <p><span className="text-white">IMDb:</span> {person.imdbId || dictionary.common.unknown}</p>
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
          <h2 className="mb-3 text-xl font-bold">{dictionary.actorDetails.knownFor}</h2>
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
                      {movie.year ?? dictionary.actorDetails.yearUnknown} | {dictionary.reviews.ratingLabel} {formatMovieRating(movie.id)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-400">{dictionary.actorDetails.noKnownFor}</p>
            )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">{dictionary.actorDetails.filmography}</h2>
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
                      {movie.year ?? dictionary.actorDetails.yearUnknown}
                      {movie.character ? ` | ${dictionary.actorDetails.role}: ${movie.character}` : ""}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400">{dictionary.actorDetails.noRoles}</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">{dictionary.actorDetails.behindScenes}</h2>
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
                      {movie.year ?? dictionary.actorDetails.yearUnknown}
                      {movie.job ? ` | ${movie.job}` : ""}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400">{dictionary.actorDetails.noCrew}</p>
              )}
            </div>
          </div>
        </section>

        <ReviewSection targetType="actor" targetId={personId} />
      </main>

      <Footer />
    </div>
  );
}
