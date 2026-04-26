-- Fix: tables in public.* had RLS policies but no GRANT for the standard
-- Supabase roles. Postgres rejects every query with "permission denied"
-- before RLS even runs.
--
-- Symptom: middleware called supabase.from('profiles').select(...) on a
-- valid session and got profile=null + error "permission denied for table
-- profiles" — every protected route then bounced back to /login.
--
-- This restores the standard Supabase grant set. RLS still gates which
-- rows each role can see; this only opens "can the role touch the table
-- at all".

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, anon, service_role;

-- Tables/functions/sequences created in the future inherit the same grants.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to authenticated, anon, service_role;
