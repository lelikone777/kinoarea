import Image from "next/image";
import Link from "next/link";
import { getImdbMovieDetails } from "../../lib/imdb";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { navLinks } from "../../data/content";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  let movie = null as Awaited<ReturnType<typeof getImdbMovieDetails>> | null;
  let errorMessage: string | null = null;

  try {
    movie = await getImdbMovieDetails(id);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Не удалось загрузить фильм";
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />
      <main className="relative z-10 mx-auto max-w-6xl px-3 sm:px-5 pb-20 sm:pb-24 pt-8 sm:pt-10">
      <Link href="/movies" className="mb-6 inline-flex text-sm text-sky-300 hover:text-sky-200">
        ← Назад к поиску
      </Link>

      {errorMessage || !movie ? (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4 text-rose-100">
          {errorMessage ?? "Не удалось загрузить фильм"}
        </div>
      ) : (
        <div className="grid gap-5 sm:gap-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
            <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{movie.title}</h1>
              <p className="text-slate-300">{movie.year} • {movie.runtime} • {movie.genre}</p>
            </div>

            <p className="text-slate-200">{movie.plot}</p>

            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <p><span className="text-white">IMDb:</span> {movie.imdbRating} ({movie.imdbVotes})</p>
              <p><span className="text-white">Режиссёр:</span> {movie.director}</p>
              <p><span className="text-white">Сценарий:</span> {movie.writer}</p>
              <p><span className="text-white">Актёры:</span> {movie.actors}</p>
              <p><span className="text-white">Премьера:</span> {movie.released}</p>
              <p><span className="text-white">Сборы:</span> {movie.boxOffice}</p>
            </div>

            {movie.ratings.length ? (
              <div className="space-y-2">
                <h2 className="text-lg font-bold">Рейтинги</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {movie.ratings.map((rating) => (
                    <div key={rating.source} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
                      <p className="text-slate-400">{rating.source}</p>
                      <p className="font-semibold text-white">{rating.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}      </main>
      <Footer />
    </div>
  );
}
