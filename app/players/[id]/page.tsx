import type { Metadata } from "next";
import { PlayerDetailPage } from "@/components/detail-pages";
import { getPlayerDetail } from "@/lib/data/details";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const player = await getPlayerDetail(params.id);
  return {
    title: `${player.name} | ${player.team.name}`,
    description: `${player.name} player profile, match appearances, goals, assists and cards.`,
  };
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await getPlayerDetail(params.id);
  return <PlayerDetailPage player={player} />;
}
