create table if not exists public.hld_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_slug text not null check (char_length(item_slug) between 1 and 240),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_slug)
);

alter table public.hld_completions enable row level security;

drop policy if exists "Users can read own HLD completions" on public.hld_completions;
create policy "Users can read own HLD completions"
  on public.hld_completions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own HLD completions" on public.hld_completions;
create policy "Users can insert own HLD completions"
  on public.hld_completions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own HLD completions" on public.hld_completions;
create policy "Users can update own HLD completions"
  on public.hld_completions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own HLD completions" on public.hld_completions;
create policy "Users can delete own HLD completions"
  on public.hld_completions
  for delete
  using (auth.uid() = user_id);
