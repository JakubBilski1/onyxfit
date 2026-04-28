"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireActiveCoach } from "@/lib/auth";

export type InviteResult =
  | { ok: true; clientId: string }
  | { ok: false; error: string };

export type InviteCodeResult =
  | { ok: true; code: string; expiresAt: string }
  | { ok: false; error: string };

// Crockford-ish alphabet — no 0/O/1/I/L to avoid manual-entry mistakes.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 10;
const INVITE_TTL_DAYS = 7;

function makeCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return out;
}

export async function generateInviteCode(
  rawEmail?: string,
): Promise<InviteCodeResult> {
  const { supabase, user } = await requireActiveCoach();

  const email = (rawEmail ?? "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email." };
  }

  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Retry on the (vanishingly unlikely) chance of a code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const { data, error } = await supabase
      .from("client_invites")
      .insert({
        code,
        coach_id: user.id,
        email: email || null,
        expires_at: expiresAt,
      })
      .select("code, expires_at")
      .single();

    if (!error && data) {
      revalidatePath("/dashboard/clients");
      return { ok: true, code: data.code, expiresAt: data.expires_at };
    }
    // 23505 = unique_violation — retry with a new code.
    if (error && (error as { code?: string }).code !== "23505") {
      return { ok: false, error: error.message };
    }
  }
  return { ok: false, error: "Could not allocate a unique code. Try again." };
}

export async function inviteClient(
  _prev: InviteResult | null,
  formData: FormData,
): Promise<InviteResult> {
  const { supabase, user } = await requireActiveCoach();

  const fullName = (formData.get("full_name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim().toLowerCase();
  const phone = (formData.get("phone") ?? "").toString().trim();
  const goals = (formData.get("goals") ?? "").toString().trim();
  const rateRaw = formData.get("monthly_rate_cents")?.toString().trim();
  const currency = (formData.get("currency") ?? "EUR").toString().trim().toUpperCase();

  if (!fullName) return { ok: false, error: "Full name required." };
  if (fullName.length > 120) return { ok: false, error: "Name too long (≤120)." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email." };
  }
  if (phone.length > 40) return { ok: false, error: "Phone too long." };
  if (goals.length > 1000) return { ok: false, error: "Goals too long." };
  const rate = rateRaw ? Number(rateRaw) : null;
  if (rate != null && (!Number.isFinite(rate) || rate < 0 || !Number.isInteger(rate))) {
    return { ok: false, error: "Rate must be a non-negative integer (cents)." };
  }
  if (currency.length !== 3) {
    return { ok: false, error: "Currency must be a 3-letter ISO code." };
  }

  const { data: client, error: cErr } = await supabase
    .from("clients")
    .insert({
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      goals: goals || null,
      onboarding_step: "invited",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (cErr) return { ok: false, error: cErr.message };

  const { error: lErr } = await supabase.from("coaches_clients").insert({
    coach_id: user.id,
    client_id: client.id,
    active: true,
    monthly_rate_cents: rate,
    currency,
  });

  if (lErr) {
    await supabase.from("clients").delete().eq("id", client.id);
    return { ok: false, error: lErr.message };
  }

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { ok: true, clientId: client.id };
}
