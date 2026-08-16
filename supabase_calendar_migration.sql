-- PetKarnem v2.59 Takvim Supabase eşitleme alanları
alter table public.calendar_events
  add column if not exists local_id text,
  add column if not exists device_id text,
  add column if not exists payload jsonb;

create unique index if not exists calendar_events_device_local_uidx
  on public.calendar_events (device_id, local_id);
