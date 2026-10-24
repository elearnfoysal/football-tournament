# Football Tournament Management Website

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Framer Motion + Embla Carousel.

Includes the tournament home page, public information pages, Supabase schema/RLS/seed data, and a protected admin workspace with live data management.

## Folder structure

```
.
├── app/
│   ├── layout.tsx            Root layout, fonts, theme, header and footer
│   ├── page.tsx              Home page (ISR, revalidate = 60)
│   ├── globals.css           Design tokens (light and dark)
│   ├── [section]/page.tsx    Fixtures, standings, teams, players, stats, bracket, news, gallery, about and contact
│   ├── admin/                 Sign-in, overview and protected data modules
│   └── loading.tsx, error.tsx, not-found.tsx, icon.svg, robots.ts, sitemap.ts
├── middleware.ts              Refreshes Supabase sessions and protects admin routes
├── components/
│   ├── admin/                 Admin module navigation and CRUD workspace
│   ├── ui/                   button, badge, card, skeleton (shadcn-style)
│   ├── home/                 hero, captain-carousel, upcoming-matches, recent-results,
│   │                         mini-standings, top-scorers-widget, news-strip, sponsors
│   ├── match-card.tsx  countdown.tsx  team-logo.tsx  player-avatar.tsx
│   ├── site-header.tsx  site-footer.tsx  theme-provider.tsx  theme-toggle.tsx
│   ├── public-data-page.tsx   Shared public section display
│   └── empty-state.tsx  section-header.tsx  rise.tsx  setup-notice.tsx
├── lib/
│   ├── supabase/             public.ts (cached anon), client.ts (browser), server.ts (cookies), admin.ts (service role)
│   ├── data/                 settings.ts, home.ts, public-pages.ts
│   ├── constants.ts  format.ts  site.ts  utils.ts
├── types/index.ts
└── supabase/
    ├── migrations/20240101000000_schema.sql
    ├── migrations/20240101000100_rls_storage.sql
    └── seed.sql
```

## 1. Supabase setup

1. Create a project at https://supabase.com (free tier).
2. Open **SQL Editor** and run, in order:
   1. `supabase/migrations/20240101000000_schema.sql`
   2. `supabase/migrations/20240101000100_rls_storage.sql`
   3. `supabase/seed.sql` (optional demo data, run once)
3. **Storage** now has four public buckets: `logos`, `players`, `banners`, `gallery`. Public read, admin-only write.
4. **Authentication > Providers > Email:** keep Email enabled and switch off **Allow new users to sign up**.
5. **Authentication > Users > Add user:** create your admin with an email and password.
6. Mark that user as admin (SQL Editor). Write access is checked against this flag:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'
   where email = 'you@example.com';
   ```
7. **Project Settings > API:** copy the Project URL, `anon` key and `service_role` key.

## 2. Run locally

```bash
npm install
cp .env.example .env.local     # fill in the three Supabase values
npm run dev                    # http://localhost:3000
```

Open `/admin` on the running site to sign in with the admin account. The protected workspace includes modules for fixtures/results, calculated standings, teams, players, match-event statistics, knockout bracket, news, gallery, tournament groups, sponsors, and about/contact settings. Create, edit and delete actions use Supabase Auth sessions and the existing admin-only RLS policies. Image fields accept JPG, PNG or WebP files and upload them to the existing admin-protected Supabase Storage buckets; the maximum sizes match the bucket limits. Changes are reflected on public pages through their 60-second revalidation.

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint`.
Optional generated DB types: `SUPABASE_PROJECT_ID=xxxx npm run gen:types` (needs the Supabase CLI).

## 3. Deploy to Vercel (short version)

Push to GitHub, import the repo in Vercel, add the env variables from `.env.example`, deploy.
A full guide comes in the final phase.

## Notes

- Match scores are derived from goal events by a database trigger. Add goals as events and the score updates itself.
- Standings view order: points, goal difference, goals for. Head-to-head is not yet applied.
- Kick-off times display in `NEXT_PUBLIC_TOURNAMENT_TZ` (default `Asia/Dhaka`).
- Public navigation pages read from the Supabase tables and views. They show empty states when their data has not been added.
- Standings are calculated from completed group matches. Record scores with goal events in **Stats / events**; the database updates match scores and player statistics automatically.
