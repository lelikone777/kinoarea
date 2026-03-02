import {
  navLinks,
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
} from "./lib/tmdb";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { BoxOfficeSection } from "./components/sections/BoxOfficeSection";
import { NewsSection } from "./components/sections/NewsSection";
import { NewsletterSection } from "./components/sections/NewsletterSection";
import { NowPlaying } from "./components/sections/NowPlaying";
import { PeopleSection } from "./components/sections/PeopleSection";
import { PopularMovies } from "./components/sections/PopularMovies";
import { TrailersSection } from "./components/sections/TrailersSection";
import { UpcomingSection } from "./components/sections/UpcomingSection";

export default async function Home() {
  const hasTmdbToken = Boolean(process.env.TMDB_ACCESS_TOKEN);

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
    hasTmdbToken ? getPopularMovies(60).catch(() => popularMovies) : Promise.resolve(popularMovies),
    hasTmdbToken ? getNowPlayingMovies().catch(() => nowPlaying) : Promise.resolve(nowPlaying),
    hasTmdbToken ? getUpcomingMovies().catch(() => upcomingMovies) : Promise.resolve(upcomingMovies),
    hasTmdbToken ? getWeeklyTrailers().catch(() => trailers) : Promise.resolve(trailers),
    hasTmdbToken ? getFeaturedTrailerHero().catch(() => null) : Promise.resolve(null),
    hasTmdbToken ? getPopularPeople(10, 1).catch(() => null) : Promise.resolve(null),
    hasTmdbToken ? getPopularPeople(10, 2).catch(() => null) : Promise.resolve(null),
    hasTmdbToken ? getPopularPeople(10, 3).catch(() => null) : Promise.resolve(null),
  ]);

  const nowPlayingLimited = nowPlayingDynamic.slice(0, 9);

  const normalizedTrailers = weeklyTrailers.length ? weeklyTrailers.slice(0, 6) : trailers.slice(0, 6);
  const popularFilled =
    popular.length >= 60
      ? popular.slice(0, 60)
      : [...Array(60)].map((_, i) => popular[i % popular.length]);
  const fallbackAvatar =
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=3&w=320&h=320&q=80";
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
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(94,234,212,0.12),transparent_25%),radial-gradient(circle_at_70%_0%,rgba(59,130,246,0.16),transparent_25%)]" />

      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto max-w-6xl px-3 sm:px-5 pb-20 sm:pb-24 pt-8 sm:pt-10">
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
      </main>

      <Footer />
    </div>
  );
}
