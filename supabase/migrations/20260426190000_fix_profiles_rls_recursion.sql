-- Fix "infinite recursion detected in policy for relation profiles"
-- triggered when admin runs UPDATE profiles (e.g. KYC approve/reject).
--
-- Root cause: profiles_update_self had a WITH CHECK that subqueried
-- profiles directly:
--    role = (SELECT role FROM profiles WHERE id = auth.uid())
-- Even though that subquery itself only reads via SELECT policies
-- (which call is_admin() — SECURITY DEFINER, fine), Postgres still
-- detects the policy chain as self-referential under some plans and
-- aborts with "infinite recursion".
--
-- Fix: drop the recursive subquery from the policy. Move the
-- role/verification_status immutability rule into a BEFORE UPDATE
-- trigger that calls is_admin() (which bypasses RLS) — same
-- guarantee, no recursion.

CREATE OR REPLACE FUNCTION public.profiles_self_immutability_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admin (and any future system role) can change anything.
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Otherwise the user must not flip their own role or verification
  -- status. They can still edit name, email, avatar, etc.
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role is immutable for non-admin users'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    RAISE EXCEPTION 'verification_status is immutable for non-admin users'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_self_immutability ON public.profiles;
CREATE TRIGGER profiles_self_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_self_immutability_trigger();

-- Replace the policy with a non-recursive version.
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
