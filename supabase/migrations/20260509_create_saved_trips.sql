create extension if not exists "pgcrypto";

create table if not exists public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  origin_city text not null,
  departure_date date not null,
  return_date date not null,
  budget_euros integer not null,
  preference text not null,
  generation_source text not null,
  generation_model text,
  destination_city text not null,
  destination_country text not null,
  summary text not null,
  why_visit text not null,
  highlights jsonb not null default '[]'::jsonb,
  sample_plan text not null,
  travel_time_text text not null,
  estimated_cost_min integer not null,
  estimated_cost_max integer not null,
  transport_mode text not null,
  transport_link text,
  transport_link_status text not null,
  transport_link_note text not null,
  stay_provider text not null,
  stay_link text,
  stay_link_status text not null,
  stay_link_note text not null,
  disclaimer text not null,
  vibe_label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists saved_trips_user_id_created_at_idx
  on public.saved_trips (user_id, created_at desc);
