import { Users } from "lucide-react";
import { CaptainCarousel } from "@/components/home/captain-carousel";
import { Hero } from "@/components/home/hero";
import { MiniStandings } from "@/components/home/mini-standings";
import { NewsStrip } from "@/components/home/news-strip";
import { RecentResults } from "@/components/home/recent-results";
import { Sponsors } from "@/components/home/sponsors";
import { TopScorersWidget } from "@/components/home/top-scorers-widget";
import { UpcomingMatches } from "@/components/home/upcoming-matches";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { SetupNotice } from "@/components/setup-notice";
import { getHomeData } from "@/lib/data/home";
import type { HomeData } from "@/types";

// Incremental static regeneration: rebuilt in the background at most every 60 seconds.
export const revalidate = 60;

export default async function HomePage() {
  let data: HomeData;
  try {
    data = await getHomeData();
  } catch (error) {
    console.error("[home]", error);
    return <SetupNotice />;
  }

  return (
    <>
      <Hero settings={data.settings} upcoming={data.upcoming} recent={data.recent} news={data.news} />
      <NewsStrip items={data.news} />

      <section className="container py-12">
        <SectionHeader title="Meet the captains" description="The leaders carrying each team through the tournament." />
        {data.captains.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Captains will be announced soon"
            description="Add players and mark one per team as captain to fill this carousel."
          />
        ) : (
          <CaptainCarousel slides={data.captains} />
        )}
      </section>

      <UpcomingMatches matches={data.upcoming} />

      <div className="container grid gap-10 pb-12 lg:grid-cols-2">
        <RecentResults matches={data.recent} />
        <div className="grid gap-10">
          <MiniStandings rows={data.standings} />
          <TopScorersWidget scorers={data.scorers} />
        </div>
      </div>

      <Sponsors sponsors={data.sponsors} />
    </>
  );
}
