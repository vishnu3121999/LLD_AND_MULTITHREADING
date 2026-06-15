create table if not exists public.workspace_problem_meta (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_name text not null check (char_length(module_name) between 1 and 240),
  completed boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, module_name)
);

alter table public.workspace_problem_meta enable row level security;

drop policy if exists "Users can read own workspace problem metadata" on public.workspace_problem_meta;
create policy "Users can read own workspace problem metadata"
  on public.workspace_problem_meta
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own workspace problem metadata" on public.workspace_problem_meta;
create policy "Users can insert own workspace problem metadata"
  on public.workspace_problem_meta
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own workspace problem metadata" on public.workspace_problem_meta;
create policy "Users can update own workspace problem metadata"
  on public.workspace_problem_meta
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own workspace problem metadata" on public.workspace_problem_meta;
create policy "Users can delete own workspace problem metadata"
  on public.workspace_problem_meta
  for delete
  using (auth.uid() = user_id);
