import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "./supabase/server";

/**
 * Server-only auth helpers. Each one returns the bound supabase client + the
 * authenticated user, or redirects to /login (or /dashboard for admin-only
 * pages) when the caller fails the gate.
 *
 * RLS is the real authority — these helpers exist so server actions can
 * fail fast with a clean redirect instead of leaking a "permission denied"
 * Postgres error to the user.
 *
 * `getCurrentUser` and `getCurrentProfile` are deduped via React's `cache()`
 * so that layout + page + helpers in the same request share a single auth
 * round-trip and a single profile query, instead of hitting Supabase 3+
 * times per navigation.
 */

export const getCurrentUser = cache(async () => {
  const supabase = getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user, error };
});

export const getCurrentProfile = cache(async () => {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, verification_status, full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, profile, error };
});

export async function requireUser() {
  const { supabase, user, error } = await getCurrentUser();
  if (!user) {
    console.error("[requireUser] getUser returned null", {
      error: error?.message,
      status: error?.status,
    });
    redirect("/login");
  }
  return { supabase, user };
}

export async function requireAdmin() {
  const { supabase, user, profile, error } = await getCurrentProfile();
  if (!user) redirect("/login");
  if (profile?.role !== "admin") {
    console.error("[requireAdmin] not admin", { role: profile?.role, dbErr: error?.message });
    redirect("/dashboard");
  }
  return { supabase, user };
}

export async function requireActiveCoach() {
  const { supabase, user, profile, error } = await getCurrentProfile();
  if (!user) redirect("/login");

  // Admins use /admin, never the trainer dashboard.
  if (profile?.role === "admin") {
    redirect("/admin");
  }
  if (profile?.role !== "coach" || profile.verification_status !== "active") {
    console.error("[requireActiveCoach] gate failed", {
      role: profile?.role,
      verification_status: profile?.verification_status,
      dbErr: error?.message,
      userId: user.id,
    });
    redirect("/login");
  }
  return { supabase, user };
}
