import type { Metadata } from "next";
import { TeamDetailPage } from "@/components/detail-pages";
import { getTeamDetail } from "@/lib/data/details";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { team } = await getTeamDetail(params.slug);
  return {
    title: team.name,
    description: `${team.name} team profile, squad, fixtures and tournament results.`,
  };
}

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const data = await getTeamDetail(params.slug);
  return <TeamDetailPage data={data} />;
}
