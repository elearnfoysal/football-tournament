import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { NAV_LINKS, SECONDARY_LINKS } from "@/lib/constants";
import type { TournamentSettings } from "@/types";

export function SiteFooter({ settings }: { settings: TournamentSettings }) {
  return (
    <footer className="mt-12 border-t bg-card">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-extrabold uppercase">{settings.name}</p>
          {settings.tagline && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{settings.tagline}</p>}
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {settings.contact_email && (
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden />
                <a href={`mailto:${settings.contact_email}`} className="hover:underline">
                  {settings.contact_email}
                </a>
              </p>
            )}
            {settings.contact_phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden />
                {settings.contact_phone}
              </p>
            )}
          </div>
        </div>

        <nav aria-label="Explore">
          <p className="font-display text-lg font-bold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground hover:text-foreground hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Information">
          <p className="font-display text-lg font-bold">Information</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground hover:text-foreground hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground hover:underline">
                Admin sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t container flex flex-col items-center justify-between gap-4 py-4 text-sm sm:flex-row">
        <p className="container py-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings.name}. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
           Developed by{" "}
          <Link
            href="https://foysalahamed.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            <b>Foysal Ahamed</b>
          </Link>
        </p>
      </div>
    </footer>
  );
}
