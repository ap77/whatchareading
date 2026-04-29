create table public.satchel_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique (user_id, recommendation_id)
);

alter table public.satchel_items enable row level security;

create policy "Users can view their own satchel items"
  on public.satchel_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own satchel items"
  on public.satchel_items for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own satchel items"
  on public.satchel_items for delete
  using (auth.uid() = user_id);
