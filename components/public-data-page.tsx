import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import type { PublicPageData } from "@/lib/data/public-pages";
import { CalendarDays } from "lucide-react";

export function PublicDataPage({ data }: { data: PublicPageData }) {
  return (
    <section className="container py-12">
      <SectionHeader title={data.title} description={data.description} />
      {data.items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={data.emptyTitle}
          description={data.emptyDescription}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.items.map((item, index) => (
            <Card key={`${item.title}-${index}`}>
              <CardContent className="p-5">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={800}
                    height={500}
                    unoptimized
                    className="mb-4 max-h-64 w-full rounded-md object-cover"
                  />
                )}
                {item.meta && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {item.meta}
                  </p>
                )}
                <h2 className="mt-1 font-display text-xl font-bold">
                  {item.href ? (
                    <Link href={item.href} className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {item.title}
                    </Link>
                  ) : item.title}
                </h2>
                {item.detail && (
                  <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{item.detail}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
