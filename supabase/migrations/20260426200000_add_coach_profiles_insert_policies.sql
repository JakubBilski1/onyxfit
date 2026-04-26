-- coach_profiles had policies for SELECT and UPDATE but none for INSERT.
-- That meant the very first upsert from a new coach (e.g. uploading their
-- first avatar before the row exists) failed with:
--   new row violates row-level security policy for table "coach_profiles"
--
-- Add an INSERT policy for self (each coach can create their own row) and
-- for admin (mirroring the existing admin update policy).

DROP POLICY IF EXISTS coach_profiles_insert_self ON public.coach_profiles;
CREATE POLICY coach_profiles_insert_self ON public.coach_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS coach_profiles_insert_admin ON public.coach_profiles;
CREATE POLICY coach_profiles_insert_admin ON public.coach_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());
