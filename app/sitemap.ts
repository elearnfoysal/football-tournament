import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Static routes for now. Match, team and player URLs are added with those pages.
const ROUTES = ["", "/matches", "/standings", "/teams", "/players", "/stats", "/bracket", "/gallery", "/news", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
