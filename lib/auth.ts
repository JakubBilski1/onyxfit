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
 */

export async function requireUser() {
  const supabase = getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
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
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    console.error("[requireAdmin] not admin", { role: profile?.role, dbErr: error?.message });
    redirect("/dashboard");
  }
  return { supabase, user };
}

export async function requireActiveCoach() {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .maybeSingle();

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
