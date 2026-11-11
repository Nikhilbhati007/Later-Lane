-- Later Lane - Supabase Postgres Schema & Row Level Security
-- Project: https://ubarkvwaiuqisrggklqn.supabase.co
-- Run this in Supabase SQL Editor (or let the Supabase MCP plugin execute it once connected).

-- 1. Focus Sessions table (stores each completed focus session and its parked urges JSONB array)
create table if not exists public.focus_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  client_id text not null,
  intent text not null,
  tag text not null default 'General',
  duration_minutes integer not null default 25 check (duration_minutes > 0),
  actual_minutes_focused integer not null default 0 check (actual_minutes_focused >= 0),
  started_at timestamptz not null,
  completed_at timestamptz,
  expiry_rate integer check (expiry_rate is null or (expiry_rate >= 0 and expiry_rate <= 100)),
  top_reason text,
  urges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint focus_sessions_user_client_unique unique (user_id, client_id)
);

create index if not exists focus_sessions_user_started_idx
  on public.focus_sessions (user_id, started_at desc);

-- 2. User Settings table (syncs theme, default duration, ambient preferences per account)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3. Safe updated_at trigger (SECURITY INVOKER with empty search_path)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_focus_sessions_updated_at on public.focus_sessions;
create trigger set_focus_sessions_updated_at
  before update on public.focus_sessions
  for each row execute function public.handle_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.focus_sessions enable row level security;
alter table public.user_settings enable row level security;

-- 5. Least-privilege grants (authenticated users only; block anon access to private sessions/settings)
revoke all on table public.focus_sessions from public, anon;
revoke all on table public.user_settings from public, anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.focus_sessions to authenticated;
grant select, insert, update, delete on table public.user_settings to authenticated;

-- 6. User-scoped RLS Policies for public.focus_sessions
drop policy if exists "focus_sessions_select_own" on public.focus_sessions;
create policy "focus_sessions_select_own"
  on public.focus_sessions
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

drop policy if exists "focus_sessions_insert_own" on public.focus_sessions;
create policy "focus_sessions_insert_own"
  on public.focus_sessions
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

drop policy if exists "focus_sessions_update_own" on public.focus_sessions;
create policy "focus_sessions_update_own"
  on public.focus_sessions
  for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "focus_sessions_delete_own" on public.focus_sessions;
create policy "focus_sessions_delete_own"
  on public.focus_sessions
  for delete
  to authenticated
  using ( (select auth.uid()) = user_id );

-- 7. User-scoped RLS Policies for public.user_settings
drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings
  for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own"
  on public.user_settings
  for delete
  to authenticated
  using ( (select auth.uid()) = user_id );

