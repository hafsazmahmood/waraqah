-- Waraqah schema: personal hadith/fiqh research notebook
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- Collections: named groupings of entries, owned by a user
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Entries: individual hadith/fiqh research notes
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  collection_id uuid references public.collections (id) on delete set null,
  title text not null,
  hadith_text text,
  translation text,
  reference text,
  personal_notes text,
  tags text[] not null default '{}',
  madhab_context text,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_id_idx on public.entries (user_id);
create index if not exists entries_collection_id_idx on public.entries (collection_id);
create index if not exists entries_tags_idx on public.entries using gin (tags);
create index if not exists collections_user_id_idx on public.collections (user_id);

-- Row Level Security: each user can only see and modify their own rows
alter table public.entries enable row level security;
alter table public.collections enable row level security;

create policy "Entries are viewable by owner"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Entries are insertable by owner"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Entries are updatable by owner"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Entries are deletable by owner"
  on public.entries for delete
  using (auth.uid() = user_id);

create policy "Collections are viewable by owner"
  on public.collections for select
  using (auth.uid() = user_id);

create policy "Collections are insertable by owner"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "Collections are updatable by owner"
  on public.collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Collections are deletable by owner"
  on public.collections for delete
  using (auth.uid() = user_id);
