alter table public.recommendations
  add column dismissed_at timestamptz;

create index recommendations_dismissed_idx
  on public.recommendations(user_id, dismissed_at)
  where dismissed_at is not null;
