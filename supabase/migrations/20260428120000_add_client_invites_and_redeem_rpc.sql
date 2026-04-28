-- Coach → client invite codes. Mobile spec lives in onyx-fit-mobile/lib/invites.ts.
create table if not exists public.client_invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  coach_id uuid not null references public.coach_profiles(id) on delete cascade,
  email text,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists client_invites_coach_id_idx on public.client_invites(coach_id);
create index if not exists client_invites_redeemable_idx
  on public.client_invites(code)
  where used_at is null;

alter table public.client_invites enable row level security;

drop policy if exists client_invites_lookup_redeemable on public.client_invites;
create policy client_invites_lookup_redeemable on public.client_invites
  for select to anon, authenticated
  using (used_at is null and expires_at > now());

drop policy if exists client_invites_select_owner on public.client_invites;
create policy client_invites_select_owner on public.client_invites
  for select to authenticated
  using (coach_id = auth.uid());

drop policy if exists client_invites_insert_owner on public.client_invites;
create policy client_invites_insert_owner on public.client_invites
  for insert to authenticated
  with check (coach_id = auth.uid());

drop policy if exists client_invites_delete_owner on public.client_invites;
create policy client_invites_delete_owner on public.client_invites
  for delete to authenticated
  using (coach_id = auth.uid());

-- redeem_client_invite RPC needs (coach_id, client_id) unique to use ON CONFLICT.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coaches_clients_coach_client_uniq'
  ) then
    alter table public.coaches_clients
      add constraint coaches_clients_coach_client_uniq unique (coach_id, client_id);
  end if;
end $$;

create or replace function public.redeem_client_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.client_invites%rowtype;
  v_user_id uuid := auth.uid();
  v_client_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select * into v_invite from public.client_invites
  where code = p_code and used_at is null and expires_at > now()
  for update;

  if not found then
    raise exception 'Invalid or expired invite code' using errcode = 'P0002';
  end if;

  select id into v_client_id from public.clients where user_id = v_user_id;
  if v_client_id is null then
    insert into public.clients (user_id, full_name, email, created_by, onboarding_step)
    values (
      v_user_id,
      coalesce(
        (select raw_user_meta_data->>'full_name' from auth.users where id = v_user_id),
        'Athlete'
      ),
      (select email from auth.users where id = v_user_id),
      v_invite.coach_id,
      'medical_questionnaire'
    )
    returning id into v_client_id;
  end if;

  insert into public.coaches_clients (coach_id, client_id, active, started_at)
  values (v_invite.coach_id, v_client_id, true, now())
  on conflict (coach_id, client_id) do update set active = true, ended_at = null;

  update public.client_invites
  set used_at = now(), used_by_user_id = v_user_id
  where id = v_invite.id;

  return v_client_id;
end $$;

grant execute on function public.redeem_client_invite(text) to authenticated;
