"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;

export type ActionResult = { ok: true } | { ok: false; error: string };

// ─── Storefront text fields ──────────────────────────────────────────────────

export async function saveCoachProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();

  const slugRaw = (formData.get("slug") ?? "").toString().trim().toLowerCase();
  const bio = (formData.get("bio") ?? "").toString().trim();
  const philosophy = (formData.get("philosophy") ?? "").toString().trim();
  const yearsRaw = formData.get("years_experience")?.toString().trim();
  const rateRaw = formData.get("monthly_rate_cents")?.toString().trim();
  const currency = (formData.get("currency") ?? "EUR").toString().trim().toUpperCase();
  const isPublic = formData.get("is_public") === "on";

  if (slugRaw && !SLUG_RE.test(slugRaw)) {
    return { ok: false, error: "Slug must be 3–40 chars: a-z, 0-9, dashes." };
  }
  const years = yearsRaw ? Number(yearsRaw) : null;
  const rate = rateRaw ? Number(rateRaw) : null;
  if (years != null && (!Number.isInteger(years) || years < 0 || years > 80)) {
    return { ok: false, error: "Years of experience must be 0–80." };
  }
  if (rate != null && (!Number.isFinite(rate) || rate < 0)) {
    return { ok: false, error: "Monthly rate must be a non-negative integer (cents)." };
  }
  if (currency.length !== 3) {
    return { ok: false, error: "Currency must be a 3-letter ISO code." };
  }

  const { error } = await supabase
    .from("coach_profiles")
    .upsert(
      {
        id: user.id,
        slug: slugRaw || null,
        bio: bio || null,
        philosophy: philosophy || null,
        years_experience: years,
        monthly_rate_cents: rate,
        currency,
        is_public: isPublic,
      },
      { onConflict: "id" },
    );

  if (error) {
    if (error.code === "23505") return { ok: false, error: "That handle is already taken." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { ok: true };
}

// ─── Specializations (text[]) ────────────────────────────────────────────────

export async function saveSpecializations(
  values: string[],
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();
  const cleaned = Array.from(
    new Set(
      values
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v.length <= 60),
    ),
  ).slice(0, 24);

  const { error } = await supabase
    .from("coach_profiles")
    .upsert({ id: user.id, specializations: cleaned }, { onConflict: "id" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

// ─── Achievements (jsonb of {title, year?, issuer?}) ─────────────────────────

export type Achievement = { title: string; year?: number; issuer?: string };

export async function saveAchievements(
  items: Achievement[],
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();

  const cleaned: Achievement[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const title = String(raw.title ?? "").trim();
    if (!title) continue;
    const year =
      raw.year == null || raw.year === ("" as unknown)
        ? undefined
        : Number(raw.year);
    if (year != null && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
      return { ok: false, error: "Year must be between 1900 and 2100." };
    }
    const issuer = raw.issuer ? String(raw.issuer).trim() : undefined;
    cleaned.push({
      title: title.slice(0, 120),
      ...(year != null ? { year } : {}),
      ...(issuer ? { issuer: issuer.slice(0, 80) } : {}),
    });
  }
  if (cleaned.length > 24) {
    return { ok: false, error: "Maximum 24 achievements." };
  }

  const { error } = await supabase
    .from("coach_profiles")
    .upsert({ id: user.id, achievements: cleaned }, { onConflict: "id" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

// ─── Avatar / cover (called by client after Storage upload) ──────────────────

export async function setCoachImage(
  kind: "avatar" | "cover",
  publicUrl: string | null,
): Promise<ActionResult> {
  const { supabase, user } = await requireActiveCoach();

  if (publicUrl != null) {
    if (typeof publicUrl !== "string" || publicUrl.length > 1000) {
      return { ok: false, error: "Invalid URL." };
    }
    if (!/^https?:\/\//i.test(publicUrl)) {
      return { ok: false, error: "URL must be absolute." };
    }
  }

  const column = kind === "avatar" ? "avatar_url" : "cover_url";
  const { error } = await supabase
    .from("coach_profiles")
    .upsert({ id: user.id, [column]: publicUrl }, { onConflict: "id" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/profile");
  return { ok: true };
}
