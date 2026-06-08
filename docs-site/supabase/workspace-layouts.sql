create table if not exists public.workspace_layouts (
  user_id uuid not null references auth.users(id) on delete cascade,
  page_id text not null,
  layouts jsonb not null default '{}'::jsonb,
  parent_zoom numeric not null default 1,
  constructor_visibility jsonb not null default '{}'::jsonb,
  collapsed_methods jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, page_id)
);

alter table public.workspace_layouts enable row level security;

drop policy if exists "Users can read own workspace layouts" on public.workspace_layouts;
create policy "Users can read own workspace layouts"
  on public.workspace_layouts
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own workspace layouts" on public.workspace_layouts;
create policy "Users can insert own workspace layouts"
  on public.workspace_layouts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own workspace layouts" on public.workspace_layouts;
create policy "Users can update own workspace layouts"
  on public.workspace_layouts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own workspace layouts" on public.workspace_layouts;
create policy "Users can delete own workspace layouts"
  on public.workspace_layouts
  for delete
  using (auth.uid() = user_id);
