-- Daily check-in records: which supplements the client took on which day.
-- Driven from the mobile app (Onyx Fit). Coaches read aggregates to gauge
-- compliance without seeing every single tap.
create table if not exists public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  supplement_item_id uuid not null references public.supplement_items(id) on delete cascade,
  taken_on date not null default current_date,
  taken_at timestamptz not null default now(),
  skipped boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique (client_id, supplement_item_id, taken_on)
);

create index if not exists supplement_logs_client_day_idx
  on public.supplement_logs(client_id, taken_on desc);
create index if not exists supplement_logs_item_idx
  on public.supplement_logs(supplement_item_id);

alter table public.supplement_logs enable row level security;

-- Client owns their own rows: read + write the logs that belong to their
-- own clients.id (joined via clients.user_id = auth.uid()).
drop policy if exists supplement_logs_select_own on public.supplement_logs;
create policy supplement_logs_select_own on public.supplement_logs
  for select to authenticated
  using (
    exists (
      select 1 from public.clients c
      where c.id = supplement_logs.client_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists supplement_logs_insert_own on public.supplement_logs;
create policy supplement_logs_insert_own on public.supplement_logs
  for insert to authenticated
  with check (
    exists (
      select 1 from public.clients c
      where c.id = supplement_logs.client_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists supplement_logs_update_own on public.supplement_logs;
create policy supplement_logs_update_own on public.supplement_logs
  for update to authenticated
  using (
    exists (
      select 1 from public.clients c
      where c.id = supplement_logs.client_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists supplement_logs_delete_own on public.supplement_logs;
create policy supplement_logs_delete_own on public.supplement_logs
  for delete to authenticated
  using (
    exists (
      select 1 from public.clients c
      where c.id = supplement_logs.client_id
        and c.user_id = auth.uid()
    )
  );

-- Coach reads logs for any of their active clients.
drop policy if exists supplement_logs_select_linked_coach on public.supplement_logs;
create policy supplement_logs_select_linked_coach on public.supplement_logs
  for select to authenticated
  using (
    exists (
      select 1 from public.coaches_clients cc
      where cc.client_id = supplement_logs.client_id
        and cc.coach_id = auth.uid()
        and cc.active = true
    )
  );
