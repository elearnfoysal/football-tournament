-- =============================================================================
-- Row Level Security + Storage
-- Public: read everything (drafts in `news` excluded).
-- Write: only users whose JWT app_metadata.role = 'admin'  (see public.is_admin()).
-- =============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'tournament_settings', 'groups', 'teams', 'players', 'matches',
    'match_events', 'match_lineups', 'gallery', 'sponsors', 'carousel_slides'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', 'public_read_' || t, t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      'public_read_' || t, t
    );

    execute format('drop policy if exists %I on public.%I', 'admin_write_' || t, t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      'admin_write_' || t, t
    );
  end loop;
end $$;

-- news: the public only sees published rows; admins see and edit everything.
alter table news enable row level security;

drop policy if exists public_read_news on news;
create policy public_read_news on news
  for select to anon, authenticated
  using (published = true);

drop policy if exists admin_write_news on news;
create policy admin_write_news on news
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- Storage buckets --------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('logos',   'logos',   true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('players', 'players', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('banners', 'banners', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('gallery', 'gallery', true, 8388608, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read tournament assets" on storage.objects;
create policy "Public read tournament assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('logos', 'players', 'banners', 'gallery'));

drop policy if exists "Admin upload tournament assets" on storage.objects;
create policy "Admin upload tournament assets" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('logos', 'players', 'banners', 'gallery') and public.is_admin());

drop policy if exists "Admin update tournament assets" on storage.objects;
create policy "Admin update tournament assets" on storage.objects
  for update to authenticated
  using (bucket_id in ('logos', 'players', 'banners', 'gallery') and public.is_admin())
  with check (bucket_id in ('logos', 'players', 'banners', 'gallery') and public.is_admin());

drop policy if exists "Admin delete tournament assets" on storage.objects;
create policy "Admin delete tournament assets" on storage.objects
  for delete to authenticated
  using (bucket_id in ('logos', 'players', 'banners', 'gallery') and public.is_admin());
