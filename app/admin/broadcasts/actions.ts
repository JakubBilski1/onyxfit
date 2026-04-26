"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

const AUDIENCES = [
  "all",
  "coaches",
  "clients",
  "active_coaches",
  "pending_coaches",
] as const;
type Audience = (typeof AUDIENCES)[number];

export type BroadcastResult = { ok: true } | { ok: false; error: string };

export async function sendBroadcast(
  _prev: BroadcastResult | null,
  formData: FormData,
): Promise<BroadcastResult> {
  const { supabase, user } = await requireAdmin();

  const title = formData.get("title")?.toString().trim() ?? "";
  const body = formData.get("body")?.toString().trim() ?? "";
  const audienceRaw = formData.get("audience")?.toString() ?? "all";
  // The current schema has no `draft` column; "Save draft" is wired to a no-op
  // until/unless the column is added. We still let the button work — it just
  // sends immediately for now.
  const _draftRequested = formData.get("intent") === "draft";

  if (!title) return { ok: false, error: "Title required." };
  if (!body) return { ok: false, error: "Body required." };
  if (title.length > 120) return { ok: false, error: "Title must be ≤120 chars." };
  if (body.length > 5000) return { ok: false, error: "Body must be ≤5000 chars." };
  if (!AUDIENCES.includes(audienceRaw as Audience)) {
    return { ok: false, error: "Invalid audience." };
  }

  const { error } = await supabase.from("admin_broadcasts").insert({
    author_id: user.id,
    title,
    body,
    audience: audienceRaw as Audience,
    sent_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/broadcasts");
  return { ok: true };
}
