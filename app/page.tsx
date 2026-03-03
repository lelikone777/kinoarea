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
} from "./data/content";
import {
  getBoxOfficeMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getWeeklyTrailers,
  getFeaturedTrailerHero,
  getPopularPeople,
} from "./lib/tmdb";
import { getIndustryNews } from "./lib/industry-news";
import { cookies, headers } from "next/headers";
import { resolveSiteLanguage, SITE_LANGUAGE_COOKIE } from "./lib/language";
import { getUiDictionary } from "./lib/i18n";
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
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const language = resolveSiteLanguage({
    cookieLanguage: cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const dictionary = getUiDictionary(language);
  const hasTmdbAuth = Boolean(process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_API_KEY);
  const canUseTmdb = hasTmdbAuth;

  const [
    popular,
    nowPlayingDynamic,
    upcomingDynamic,
    weeklyTrailers,
    featuredHero,
    peopleWeek,
    peopleMonth,
    peopleYear,
    industryNews,
    boxOfficeDynamic,
  ] = await Promise.all([
    canUseTmdb ? getPopularMovies(60, undefined, language).catch(() => popularMovies) : Promise.resolve(popularMovies),
    canUseTmdb ? getNowPlayingMovies(undefined, language).catch(() => nowPlaying) : Promise.resolve(nowPlaying),
    canUseTmdb ? getUpcomingMovies(undefined, language).catch(() => upcomingMovies) : Promise.resolve(upcomingMovies),
    canUseTmdb ? getWeeklyTrailers(undefined, language).catch(() => trailers) : Promise.resolve(trailers),
    canUseTmdb ? getFeaturedTrailerHero(language).catch(() => null) : Promise.resolve(null),
    canUseTmdb ? getPopularPeople(10, 1, language).catch(() => null) : Promise.resolve(null),
    canUseTmdb ? getPopularPeople(10, 2, language).catch(() => null) : Promise.resolve(null),
    canUseTmdb ? getPopularPeople(10, 3, language).catch(() => null) : Promise.resolve(null),
    getIndustryNews(language).catch(() => newsArticles),
    canUseTmdb
      ? getBoxOfficeMovies({ language, period: "weekend", sortBy: "revenue.desc", limit: 6 }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const nowPlayingLimited = nowPlayingDynamic.slice(0, 9);

  const normalizedTrailers = weeklyTrailers.length ? weeklyTrailers.slice(0, 6) : trailers.slice(0, 6);
  const popularFilled =
    popular.length >= 60
      ? popular.slice(0, 60)
      : [...Array(60)].map((_, i) => popular[i % popular.length]);
  const newsletterPosters = popular
    .filter((movie) => Boolean(movie.image))
    .slice(0, 3)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      image: movie.image,
    }));
  const fallbackAvatar = "/placeholders/avatar.svg";
  const fallbackPeopleWeek = [
    ...peopleSpotlight,
    ...peopleBoard.map((p) => ({
      name: p.name,
      role: p.role,
      knownFor: dictionary.actorDetails.actorFallback,
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
      <NewsSection articles={industryNews.length ? industryNews : newsArticles} />
      <UpcomingSection movies={upcomingDynamic} />
      <BoxOfficeSection entries={boxOfficeDynamic} language={language} />
      <NewsletterSection posters={newsletterPosters} />
    </PageShell>
  );
}
