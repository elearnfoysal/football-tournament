import Image from "next/image";
import { SectionHeader } from "@/components/section-header";
import type { Sponsor } from "@/types";

function SponsorTile({ sponsor }: { sponsor: Sponsor }) {
  const content = sponsor.logo_url ? (
    <Image
      src={sponsor.logo_url}
      alt={sponsor.name}
      width={160}
      height={64}
      unoptimized
      style={{ width: "auto", height: 48 }}
      className="object-contain"
    />
  ) : (
    <span className="font-display text-xl font-bold text-muted-foreground">{sponsor.name}</span>
  );

  const classes =
    "flex h-24 items-center justify-center rounded-lg border bg-card px-4 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return sponsor.website_url ? (
    <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer sponsored" className={classes}>
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  return (
    <section className="container py-12">
      <SectionHeader title="Our sponsors" description="Thank you to the partners who make this tournament possible." />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sponsors.map((sponsor) => (
          <li key={sponsor.id}>
            <SponsorTile sponsor={sponsor} />
          </li>
        ))}
      </ul>
    </section>
  );
}
