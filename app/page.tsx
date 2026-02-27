import {
  nowFilters,
  nowPlaying,
  trailerHero,
  trailers,
  popularMovies,
  peopleSpotlight,
  peopleBoard,
  newsArticles,
  upcomingMovies,
  boxOffice,
} from "./data/content";
import {
  getPopularMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getWeeklyTrailers,
  getFeaturedTrailerHero,
  getPopularPeople,
  isTmdbReachable,
} from "./lib/tmdb";
import { PageShell } from "./components/layout/PageShell";
import { BoxOfficeSection } from "./components/sections/BoxOfficeSection";
import { NewsSection } from "./components/sections/NewsSection";
import { NewsletterSection } from "./components/sections/NewsletterSection";
import { NowPlaying } from "./components/sections/NowPlaying";
import { PeopleSection } from "./components/sections/PeopleSection";
import { PopularMovies } from "./components/sections/PopularMovies";
import { TrailersSection } from "./components/sections/TrailersSection";
import { UpcomingSection } from "./components/sections/UpcomingSection";

export default async function Home() {
  const hasTmdbAuth = Boolean(process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_API_KEY);
  const canUseTmdb = hasTmdbAuth ? await isTmdbReachable() : false;

  const [
    popular,
    nowPlayingDynamic,
    upcomingDynamic,
    weeklyTrailers,
    featuredHero,
    peopleWeek,
    peopleMonth,
    peopleYear,
  ] = await Promise.all([
    canUseTmdb ? getPopularMovies(60).catch(() => popularMovies) : Promise.resolve(popularMovies),
    canUseTmdb ? getNowPlayingMovies().catch(() => nowPlaying) : Promise.resolve(nowPlaying),
    canUseTmdb ? getUpcomingMovies().catch(() => upcomingMovies) : Promise.resolve(upcomingMovies),
    canUseTmdb ? getWeeklyTrailers().catch(() => trailers) : Promise.resolve(trailers),
    canUseTmdb ? getFeaturedTrailerHero().catch(() => null) : Promise.resolve(null),
    canUseTmdb ? getPopularPeople(10, 1).catch(() => null) : Promise.resolve(null),
    canUseTmdb ? getPopularPeople(10, 2).catch(() => null) : Promise.resolve(null),
    canUseTmdb ? getPopularPeople(10, 3).catch(() => null) : Promise.resolve(null),
  ]);

  const nowPlayingLimited = nowPlayingDynamic.slice(0, 9);

  const normalizedTrailers = weeklyTrailers.length ? weeklyTrailers.slice(0, 6) : trailers.slice(0, 6);
  const popularFilled =
    popular.length >= 60
      ? popular.slice(0, 60)
      : [...Array(60)].map((_, i) => popular[i % popular.length]);
  const fallbackAvatar = "/placeholders/avatar.svg";
  const fallbackPeopleWeek = [
    ...peopleSpotlight,
    ...peopleBoard.map((p) => ({
      name: p.name,
      role: p.role,
      knownFor: "Популярный артист",
      delta: p.delta,
      image: fallbackAvatar,
    })),
  ];

  return (
    <PageShell
      mainClassName="relative z-10 mx-auto flex-1 max-w-6xl px-5 pb-24 pt-10"
      overlay={
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(94,234,212,0.12),transparent_25%),radial-gradient(circle_at_70%_0%,rgba(59,130,246,0.16),transparent_25%)]" />
      }
    >
      <NowPlaying movies={nowPlayingLimited} filters={nowFilters} />
      <TrailersSection hero={featuredHero ?? trailerHero} trailers={normalizedTrailers} />
      <PopularMovies movies={popularFilled} />
      <PeopleSection
        week={peopleWeek ?? fallbackPeopleWeek}
        month={peopleMonth ?? fallbackPeopleWeek}
        year={peopleYear ?? fallbackPeopleWeek}
      />
      <NewsSection articles={newsArticles} />
      <UpcomingSection movies={upcomingDynamic} />
      <BoxOfficeSection entries={boxOffice} />
      <NewsletterSection />
    </PageShell>
  );
}

