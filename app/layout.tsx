import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getSettings } from "@/lib/data/settings";
import { getSiteUrl } from "@/lib/site";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description =
    settings.tagline ?? `Fixtures, results, standings and stats for ${settings.name}.`;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: settings.name, template: `%s | ${settings.name}` },
    description,
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: settings.name,
      description,
      images: settings.logo_url ? [{ url: settings.logo_url }] : undefined,
    },
    twitter: { card: "summary_large_image", title: settings.name, description },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#07100b" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader name={settings.name} logoUrl={settings.logo_url} />
          <main id="main">{children}</main>
          <SiteFooter settings={settings} />
        </ThemeProvider>
      </body>
    </html>
  );
}
