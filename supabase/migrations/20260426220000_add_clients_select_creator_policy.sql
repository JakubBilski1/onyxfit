-- "new row violates row-level security policy for table 'clients'" was
-- actually a misleading PostgREST error coming from the .select("id")
-- chained on .insert(). PostgREST issues:
--   WITH x AS (INSERT ... RETURNING *) SELECT * FROM x WHERE <select_rls>
-- The INSERT passes WITH CHECK fine, but no SELECT policy matches the
-- freshly-inserted row:
--   * clients_select_owner_coach uses coach_owns_client(id) — needs a row
--     in coaches_clients, which inviteClient inserts only AFTER the
--     client row succeeds.
--   * clients_select_self needs user_id = auth.uid(), but a new client
--     has no Supabase account yet (user_id is NULL).
-- PostgREST then reports the empty RETURNING as a WITH CHECK failure.
--
-- Fix: let the creator read their own clients. created_by is set on
-- INSERT and never changes, so this is a stable identity.

DROP POLICY IF EXISTS clients_select_creator ON public.clients;
CREATE POLICY clients_select_creator ON public.clients
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Same shape for admin SELECT — useful for admin tooling that touches
-- clients without going through the coaches_clients link.
DROP POLICY IF EXISTS clients_select_admin ON public.clients;
CREATE POLICY clients_select_admin ON public.clients
  FOR SELECT
  TO authenticated
  USING (is_admin());
