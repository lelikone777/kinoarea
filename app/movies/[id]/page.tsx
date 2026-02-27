import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { navLinks } from "../../data/content";
import { getMovieFullDetails } from "../../lib/tmdb";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

function formatRuntime(minutes?: number) {
  if (!minutes || minutes <= 0) return "N/A";
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US");
}

function formatMoney(amount?: number) {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isFinite(movieId)) {
    return { title: "Movie not found" };
  }

  try {
    const movie = await getMovieFullDetails(movieId);
    return {
      title: `${movie.title}${movie.year ? ` (${movie.year})` : ""} | TMDB`,
      description: movie.overview || `Movie details for ${movie.title}`,
    };
  } catch {
    return { title: "Movie details" };
  }
}

export default async function MovieDetailsPage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isFinite(movieId)) notFound();

  let movie;
  try {
    movie = await getMovieFullDetails(movieId);
  } catch {
    notFound();
  }

  const trailer = movie.trailers[0];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto flex-1 max-w-6xl space-y-8 px-5 pb-24 pt-10">
        <Link href="/movies" className="inline-flex text-sm text-sky-300 hover:text-sky-200">
          Back to catalog
        </Link>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-[320px_1fr]">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
            <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-extrabold">{movie.title}</h1>
              <p className="text-slate-300">
                {movie.year ?? "N/A"} | {formatRuntime(movie.runtime)} | TMDB {movie.voteAverage.toFixed(1)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="rounded-full border border-white/15 px-3 py-1 text-slate-200">
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-slate-200">{movie.overview || "No overview available."}</p>

            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <p><span className="text-white">Release date:</span> {formatDate(movie.releaseDate)}</p>
              <p><span className="text-white">Status:</span> {movie.status || "N/A"}</p>
              <p><span className="text-white">Budget:</span> {formatMoney(movie.budget)}</p>
              <p><span className="text-white">Revenue:</span> {formatMoney(movie.revenue)}</p>
              <p><span className="text-white">Language:</span> {movie.originalLanguage || "N/A"}</p>
              <p><span className="text-white">Vote count:</span> {movie.voteCount ?? 0}</p>
            </div>

            {movie.homepage ? (
              <a
                href={movie.homepage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl border border-white/20 px-3 py-2 text-sm hover:border-white/40"
              >
                Official site
              </a>
            ) : null}
          </div>
        </section>

        {trailer ? (
          <section className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="text-xl font-bold">Trailer</h2>
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Cast</h2>
            <div className="space-y-2">
              {movie.cast.length ? (
                movie.cast.slice(0, 12).map((actor) => (
                  <Link
                    key={`${actor.id}-${actor.name}`}
                    href={`/actors/${actor.id}`}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image src={actor.profile || movie.poster} alt={actor.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{actor.name}</p>
                      <p className="text-xs text-slate-400">{actor.character || "Unknown role"}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400">No cast data.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Crew</h2>
            <div className="space-y-2">
              {movie.crew.length ? (
                movie.crew.slice(0, 12).map((member) => (
                  <div key={`${member.id}-${member.name}-${member.job}`} className="rounded-xl bg-white/5 p-2">
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-slate-400">
                      {member.job || "Unknown job"}
                      {member.department ? ` | ${member.department}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No crew data.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-xl font-bold">Similar</h2>
            <div className="grid grid-cols-2 gap-3">
              {movie.similar.slice(0, 6).map((item) => (
                <Link
                  key={item.id ?? item.title}
                  href={item.id ? `/movies/${item.id}` : "#"}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
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
            <h2 className="mb-3 text-xl font-bold">Recommendations</h2>
            <div className="grid grid-cols-2 gap-3">
              {movie.recommendations.slice(0, 6).map((item) => (
                <Link
                  key={item.id ?? item.title}
                  href={item.id ? `/movies/${item.id}` : "#"}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
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
      </main>

      <Footer />
    </div>
  );
}
