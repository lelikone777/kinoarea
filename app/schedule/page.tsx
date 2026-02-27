"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PageShell } from "../components/layout/PageShell";
import { StyledSelect, type StyledSelectOption } from "../components/ui/StyledSelect";
import { ErrorCard, InfoCard } from "../components/ui/Cards";
import { useUiDictionary } from "../hooks/useUiDictionary";
import { formatCountWithNoun } from "../lib/pluralize";

type City = { id: string; name: string };
type Cinema = { id: string; name: string; chain: string; address: string };
type Hall = { id: string; name: string };
type Movie = {
  id: string;
  title: string;
  poster: string;
  ageRating: string;
  runtimeMin: number;
  genres: string[];
  description: string;
};
type Screening = {
  id: string;
  cinemaId: string;
  hallId: string;
  movieId: string;
  startsAt: string;
  format: string;
  pricesRub: { standard: number; premium: number };
};

type DemoScheduleResponse = {
  cities: City[];
  cinemas: Cinema[];
  halls: Hall[];
  movies: Movie[];
  screenings: Screening[];
  error?: string;
};

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(date: Date, language: string) {
  return date.toLocaleDateString(language, { weekday: "short", day: "2-digit", month: "short" });
}

function formatTime(iso: string, language: string) {
  return new Date(iso).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
}

export default function SchedulePage() {
  const { language, dictionary } = useUiDictionary();
  const [cityId, setCityId] = useState("msk");
  const [day, setDay] = useState(() => toDayKey(new Date()));
  const [data, setData] = useState<DemoScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 3 }, (_, idx) => {
      const d = new Date(base);
      d.setDate(d.getDate() + idx);
      return {
        key: toDayKey(d),
        label: idx === 0 ? `${dictionary.schedule.todayPrefix}, ${formatDayLabel(d, language)}` : formatDayLabel(d, language),
      };
    });
  }, [language, dictionary.schedule.todayPrefix]);

  const dayOptions = useMemo<StyledSelectOption[]>(
    () => days.map((d) => ({ value: d.key, label: d.label })),
    [days],
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ cityId, day });
        const res = await fetch(`/api/demo/schedule?${params.toString()}`);
        const json = (await res.json()) as DemoScheduleResponse;
        if (!res.ok) {
          throw new Error(json.error || "Failed to load schedule.");
        }
        if (mounted) {
          setData(json);
        }
      } catch (e) {
        if (mounted) {
          setData(null);
          setError(e instanceof Error ? e.message : "Failed to load schedule.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [cityId, day]);

  const cityOptions = useMemo<StyledSelectOption[]>(
    () => (data?.cities ?? []).map((c) => ({ value: c.id, label: c.name })),
    [data?.cities],
  );

  const cinemasById = useMemo(() => new Map((data?.cinemas ?? []).map((c) => [c.id, c])), [data?.cinemas]);

  const screeningsByMovie = useMemo(() => {
    const result = new Map<string, Screening[]>();
    for (const s of data?.screenings ?? []) {
      const list = result.get(s.movieId) ?? [];
      list.push(s);
      result.set(s.movieId, list);
    }
    for (const list of result.values()) {
      list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    }
    return result;
  }, [data?.screenings]);

  const moviesWithScreenings = useMemo(() => {
    const movies = data?.movies ?? [];
    return movies
      .map((m) => ({ movie: m, screenings: screeningsByMovie.get(m.id) ?? [] }))
      .filter((entry) => entry.screenings.length > 0);
  }, [data?.movies, screeningsByMovie]);
  const moviesWithScreeningsLabel = formatCountWithNoun(moviesWithScreenings.length, language, {
    ru: ["фильм", "фильма", "фильмов"],
    other: ["movie", "movies"],
  });

  return (
    <PageShell>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{dictionary.schedule.title}</h1>
        <p className="text-sm text-slate-300">{dictionary.schedule.subtitle}</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <StyledSelect value={cityId} onChange={(nextValue) => setCityId(nextValue)} options={cityOptions} placeholder={dictionary.schedule.city} />

        <StyledSelect value={day} onChange={(nextValue) => setDay(nextValue)} options={dayOptions} placeholder={dictionary.schedule.day} />

        <div className="hidden items-center justify-end text-sm text-slate-300 lg:flex">
          {isLoading ? dictionary.common.loading : moviesWithScreeningsLabel}
        </div>
      </div>

      {error ? <ErrorCard>{error}</ErrorCard> : null}

      {!isLoading && !error && moviesWithScreenings.length === 0 ? (
        <InfoCard>{dictionary.schedule.noSessions}</InfoCard>
      ) : null}

      <div className="grid gap-4">
        {moviesWithScreenings.map(({ movie, screenings }) => {
          const genres = movie.genres.join(" • ");

          return (
            <section key={movie.id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
              <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr]">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">{movie.ageRating}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">{movie.runtimeMin} min</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">{genres}</span>
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold">{movie.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-300">{movie.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {screenings.map((s) => {
                      const cinema = cinemasById.get(s.cinemaId);
                      const label = `${formatTime(s.startsAt, language)} • ${s.format}`;
                      const hint = cinema ? `${cinema.chain}: ${cinema.name}` : dictionary.schedule.cinemaFallback;
                      const min = Math.min(s.pricesRub.standard, s.pricesRub.premium);

                      return (
                        <Link
                          key={s.id}
                          href={`/schedule/${s.id}`}
                          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-300/60 hover:bg-white/10"
                          aria-label={`${movie.title}, ${hint}, ${label}`}
                        >
                          <span className="text-white">{label}</span>
                          <span className="text-xs text-slate-300">{hint}</span>
                          <span className="ml-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-bold text-emerald-200">
                            {dictionary.schedule.fromPrice} {min}₽
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {data ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <p className="font-semibold text-white">{dictionary.schedule.demoNoteTitle}</p>
          <p className="mt-1">{dictionary.schedule.demoNoteBody}</p>
        </div>
      ) : null}
    </PageShell>
  );
}
