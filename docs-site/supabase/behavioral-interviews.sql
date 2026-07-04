create table if not exists public.behavioral_stories (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 120),
  title text not null check (char_length(title) between 1 and 240),
  situation text not null default '',
  task text not null default '',
  action text not null default '',
  result text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.behavioral_stories enable row level security;

drop policy if exists "Users can read own behavioral stories" on public.behavioral_stories;
create policy "Users can read own behavioral stories"
  on public.behavioral_stories
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own behavioral stories" on public.behavioral_stories;
create policy "Users can insert own behavioral stories"
  on public.behavioral_stories
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own behavioral stories" on public.behavioral_stories;
create policy "Users can update own behavioral stories"
  on public.behavioral_stories
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own behavioral stories" on public.behavioral_stories;
create policy "Users can delete own behavioral stories"
  on public.behavioral_stories
  for delete
  using (auth.uid() = user_id);

create table if not exists public.behavioral_answers (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null check (char_length(question_id) between 1 and 180),
  story_id text,
  answer text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.behavioral_answers enable row level security;

drop policy if exists "Users can read own behavioral answers" on public.behavioral_answers;
create policy "Users can read own behavioral answers"
  on public.behavioral_answers
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own behavioral answers" on public.behavioral_answers;
create policy "Users can insert own behavioral answers"
  on public.behavioral_answers
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own behavioral answers" on public.behavioral_answers;
create policy "Users can update own behavioral answers"
  on public.behavioral_answers
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own behavioral answers" on public.behavioral_answers;
create policy "Users can delete own behavioral answers"
  on public.behavioral_answers
  for delete
  using (auth.uid() = user_id);
