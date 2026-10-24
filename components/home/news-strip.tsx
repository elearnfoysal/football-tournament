import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatLongDate } from "@/lib/format";
import type { NewsItem } from "@/types";

export function NewsStrip({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Announcements and news" className="border-b bg-secondary/40">
      <div className="container py-4">
        <ul className="flex snap-x gap-3 overflow-x-auto pb-1">
          {items.map((item) => (
            <li key={item.id} className="w-72 shrink-0 snap-start sm:w-80">
              <Link
                href={`/news/${item.slug}`}
                className="block h-full rounded-lg border bg-card p-4 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={item.is_announcement ? "accent" : "default"}>
                    {item.is_announcement ? "Announcement" : "News"}
                  </Badge>
                  <time dateTime={item.published_at}>{formatLongDate(item.published_at)}</time>
                </div>
                <p className="mt-2 line-clamp-2 font-semibold leading-snug">{item.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
