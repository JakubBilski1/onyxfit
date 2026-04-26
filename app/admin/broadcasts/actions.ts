"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { mailer } from "@/lib/mailer";
import { broadcastEmail } from "@/lib/mailer/templates";

const AUDIENCES = [
  "all",
  "coaches",
  "clients",
  "active_coaches",
  "pending_coaches",
] as const;
type Audience = (typeof AUDIENCES)[number];

export type BroadcastResult =
  | { ok: true; recipients: number; failed: number }
  | { ok: false; error: string };

const MAX_RECIPIENTS = 500;
const PARALLEL_BATCH = 10;

export async function sendBroadcast(
  _prev: BroadcastResult | null,
  formData: FormData,
): Promise<BroadcastResult> {
  const { supabase, user } = await requireAdmin();

  const title = formData.get("title")?.toString().trim() ?? "";
  const body = formData.get("body")?.toString().trim() ?? "";
  const audienceRaw = formData.get("audience")?.toString() ?? "all";
  const _draftRequested = formData.get("intent") === "draft";

  if (!title) return { ok: false, error: "Title required." };
  if (!body) return { ok: false, error: "Body required." };
  if (title.length > 120) return { ok: false, error: "Title must be ≤120 chars." };
  if (body.length > 5000) return { ok: false, error: "Body must be ≤5000 chars." };
  if (!AUDIENCES.includes(audienceRaw as Audience)) {
    return { ok: false, error: "Invalid audience." };
  }
  const audience = audienceRaw as Audience;

  // Resolve email list ────────────────────────────────────────────────────────
  const emails = await resolveAudienceEmails(supabase, audience);
  if (emails.length > MAX_RECIPIENTS) {
    return {
      ok: false,
      error: `Audience too large (${emails.length}). Hard cap is ${MAX_RECIPIENTS} for one-shot send — ask engineering for a queued path.`,
    };
  }

  // Persist row ───────────────────────────────────────────────────────────────
  const { error } = await supabase.from("admin_broadcasts").insert({
    author_id: user.id,
    title,
    body,
    audience,
    sent_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  // Fan out emails ────────────────────────────────────────────────────────────
  let failed = 0;
  const m = mailer();
  for (let i = 0; i < emails.length; i += PARALLEL_BATCH) {
    const batch = emails.slice(i, i + PARALLEL_BATCH);
    const results = await Promise.all(
      batch.map((to) =>
        m.send(broadcastEmail({ to, title, body, audience })).catch((e) => ({
          ok: false as const,
          error: e?.message ?? String(e),
        })),
      ),
    );
    for (const r of results) {
      if (!r.ok) {
        failed++;
        console.warn("[broadcast] mailer error:", (r as any).error);
      }
    }
  }

  revalidatePath("/admin/broadcasts");
  return { ok: true, recipients: emails.length, failed };
}

async function resolveAudienceEmails(
  supabase: ReturnType<typeof import("@/lib/supabase/server").getSupabaseServer>,
  audience: Audience,
): Promise<string[]> {
  const out = new Set<string>();

  // Coaches / admins live in `profiles`
  const wantsCoaches =
    audience === "all" ||
    audience === "coaches" ||
    audience === "active_coaches" ||
    audience === "pending_coaches";
  if (wantsCoaches) {
    let q = supabase.from("profiles").select("email").eq("role", "coach");
    if (audience === "active_coaches") q = q.eq("verification_status", "active");
    if (audience === "pending_coaches")
      q = q.in("verification_status", ["pending_verification", "under_review"]);
    const { data, error } = await q;
    if (error) throw new Error(`profiles query failed: ${error.message}`);
    for (const r of data ?? []) {
      const e = (r as any).email?.toString().trim().toLowerCase();
      if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) out.add(e);
    }
  }

  // Clients live in their own table
  const wantsClients = audience === "all" || audience === "clients";
  if (wantsClients) {
    const { data, error } = await supabase
      .from("clients")
      .select("email")
      .not("email", "is", null);
    if (error) throw new Error(`clients query failed: ${error.message}`);
    for (const r of data ?? []) {
      const e = (r as any).email?.toString().trim().toLowerCase();
      if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) out.add(e);
    }
  }

  return Array.from(out);
}
