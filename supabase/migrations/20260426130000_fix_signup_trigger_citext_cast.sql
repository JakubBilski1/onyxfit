-- Fix: Auth signup was failing with "Database error saving new user".
--
-- Root cause: tg_handle_new_auth_user (and tg_sync_profile_email) cast
-- new.email::citext explicitly. The citext extension lives in the
-- 'extensions' schema, but the triggers ran with search_path = public, so
-- Postgres couldn't resolve the type and aborted the auth.users insert.
--
-- Fix: drop the explicit ::citext cast — the target column profiles.email is
-- already of type citext, so Postgres performs an implicit text → citext
-- cast on insert. Also pin search_path = public, extensions on both
-- functions in case anything else inside ever needs the extension.

create or replace function public.tg_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_role public.user_role := 'coach';
begin
  if (new.raw_user_meta_data ? 'role')
     and new.raw_user_meta_data->>'role' in ('coach','client') then
    v_role := (new.raw_user_meta_data->>'role')::public.user_role;
  end if;

  insert into public.profiles (id, role, verification_status, full_name, email)
  values (
    new.id,
    v_role,
    case
      when v_role = 'coach' then 'pending_verification'::public.verification_status
      else 'active'::public.verification_status
    end,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do nothing;

  if v_role = 'coach' then
    insert into public.coach_profiles (id) values (new.id) on conflict (id) do nothing;
  end if;

  return new;
end
$$;

create or replace function public.tg_sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if (new.email is distinct from old.email) then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end
$$;
