-- Allow service_role JWTs to bypass the profiles immutability trigger.
--
-- Symptom: KYC submission fails with
--   "verification_status is immutable for non-admin users"
-- even though the call is made from the coach-kyc-submit edge function
-- using the service_role key.
--
-- Root cause: profiles_self_immutability_trigger only bypasses for
-- public.is_admin(), which calls auth.uid(). When the request uses the
-- service_role key (no end-user JWT), auth.uid() returns NULL, so
-- is_admin() returns false and the trigger raises.
--
-- Fix: also bypass for auth.jwt() ->> 'role' = 'service_role'. Trusted
-- server-side code (edge functions, server actions) already enforces
-- application-level authorization before issuing the write.

CREATE OR REPLACE FUNCTION public.profiles_self_immutability_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins and trusted server-side code may change anything.
  IF public.is_admin()
     OR coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  THEN
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
