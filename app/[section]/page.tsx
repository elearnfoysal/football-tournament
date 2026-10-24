import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDataPage } from "@/components/public-data-page";
import { getPublicPageData, PUBLIC_SECTIONS } from "@/lib/data/public-pages";

export const revalidate = 60;

export function generateStaticParams() {
  return PUBLIC_SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: { section: string };
}): Promise<Metadata> {
  if (!PUBLIC_SECTIONS.includes(params.section as (typeof PUBLIC_SECTIONS)[number])) notFound();
  const page = await getPublicPageData(params.section);
  return { title: page.title, description: page.description };
}

export default async function PublicSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const data = await getPublicPageData(params.section);
  return <PublicDataPage data={data} />;
}
