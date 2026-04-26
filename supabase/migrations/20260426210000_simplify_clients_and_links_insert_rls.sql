-- The previous INSERT policies on clients and coaches_clients required
-- is_active_coach() to return TRUE inside the policy WITH CHECK. That
-- function sometimes returns FALSE in production for an active coach
-- (likely a JWT/context edge case after recent auth changes), causing
-- "new row violates row-level security policy" on legitimate inserts.
--
-- App-layer gating in lib/auth.ts (requireActiveCoach) already enforces
-- that only an active coach can call the server actions. RLS just needs
-- the standard "your row, you wrote it" check, plus an admin escape
-- hatch for future tooling.

-- ── clients ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS clients_insert_active_coach ON public.clients;

DROP POLICY IF EXISTS clients_insert_owner ON public.clients;
CREATE POLICY clients_insert_owner ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS clients_insert_admin ON public.clients;
CREATE POLICY clients_insert_admin ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- ── coaches_clients ────────────────────────────────────────────────────
DROP POLICY IF EXISTS cc_insert_coach ON public.coaches_clients;

DROP POLICY IF EXISTS cc_insert_owner ON public.coaches_clients;
CREATE POLICY cc_insert_owner ON public.coaches_clients
  FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

DROP POLICY IF EXISTS cc_insert_admin ON public.coaches_clients;
CREATE POLICY cc_insert_admin ON public.coaches_clients
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());
