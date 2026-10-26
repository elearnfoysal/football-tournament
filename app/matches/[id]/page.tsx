import type { Metadata } from "next";
import { MatchDetailPage } from "@/components/detail-pages";
import { getMatchDetail } from "@/lib/data/details";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const match = await getMatchDetail(params.id);
  return {
    title: `${match.home.name} vs ${match.away.name}`,
    description: `${match.home.name} vs ${match.away.name} match score, events and match report.`,
  };
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await getMatchDetail(params.id);
  return <MatchDetailPage match={match} />;
}
