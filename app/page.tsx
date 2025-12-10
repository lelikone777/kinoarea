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

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(94,234,212,0.12),transparent_25%),radial-gradient(circle_at_70%_0%,rgba(59,130,246,0.16),transparent_25%)]" />

      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-10">
        <NowPlaying movies={nowPlaying} filters={nowFilters} />
        <TrailersSection hero={trailerHero} trailers={trailers} />
        <PopularMovies movies={popularMovies} />
        <PeopleSection spotlight={peopleSpotlight} board={peopleBoard} />
        <NewsSection articles={newsArticles} />
        <UpcomingSection movies={upcomingMovies} />
        <BoxOfficeSection entries={boxOffice} />
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}
