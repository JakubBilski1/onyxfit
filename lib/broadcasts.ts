import "server-only";
import { getSupabaseServer } from "./supabase/server";
import type { LatestBroadcast } from "@/components/onyx/broadcast-banner";

type Scope = "active_coach" | "pending_coach" | "client" | "admin";

const ALLOWED_AUDIENCES: Record<Scope, string[]> = {
  active_coach: ["all", "coaches", "active_coaches"],
  pending_coach: ["all", "coaches", "pending_coaches"],
  client: ["all", "clients"],
  admin: [], // admins author broadcasts; the banner is for end users
};

/**
 * Returns the most recent broadcast targeted at the given audience scope, or
 * null if none. Caller renders <BroadcastBanner /> with this; the banner
 * filters out dismissed broadcasts via localStorage.
 */
export async function getLatestBroadcastFor(
  scope: Scope,
): Promise<LatestBroadcast | null> {
  const audiences = ALLOWED_AUDIENCES[scope];
  if (audiences.length === 0) return null;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("admin_broadcasts")
    .select("id, title, body, audience, sent_at")
    .in("audience", audiences)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as LatestBroadcast | null) ?? null;
}
